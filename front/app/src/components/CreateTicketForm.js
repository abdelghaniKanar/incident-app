import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { ticketService } from '../services/api';

const CreateTicketForm = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'bug'
  });

  const [errors, setErrors] = useState({});

  const priorities = [
    { key: 'low', label: 'Faible', color: '#28a745', icon: '🟢' },
    { key: 'medium', label: 'Moyen', color: '#ffc107', icon: '🟡' },
    { key: 'high', label: 'Élevé', color: '#fd7e14', icon: '🟠' },
    { key: 'urgent', label: 'Urgent', color: '#dc3545', icon: '🔴' }
  ];

  const categories = [
    { key: 'bug', label: 'Bug / Défaut', icon: '🐛' },
    { key: 'hardware', label: 'Matériel', icon: '🖥️' },
    { key: 'software', label: 'Logiciel', icon: '💻' },
    { key: 'network', label: 'Réseau', icon: '🌐' },
    { key: 'other', label: 'Autre', icon: '❓' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Le titre doit contenir au moins 5 caractères';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    } else if (formData.description.length < 20) {
      newErrors.description = 'La description doit contenir au moins 20 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setLoading(true);

    try {
      const ticketData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim()
      };

      const response = await ticketService.createTicket(ticketData);
      
      Alert.alert(
        'Succès',
        'Votre ticket a été créé avec succès!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                title: '',
                description: '',
                priority: 'medium',
                category: 'bug'
              });
              navigation.navigate('TicketList', { refresh: true });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur création ticket:', error);
      Alert.alert(
        'Erreur',
        error.response?.data?.message || 'Impossible de créer le ticket. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPrioritySelector = () => (
    <TouchableOpacity
      style={[styles.selectorButton, errors.priority && styles.inputError]}
      onPress={() => setShowPriorityModal(true)}
    >
      <Text style={styles.selectorLabel}>Priorité</Text>
      <View style={styles.selectorValue}>
        <Text style={styles.selectorIcon}>
          {priorities.find(p => p.key === formData.priority)?.icon}
        </Text>
        <Text style={styles.selectorText}>
          {priorities.find(p => p.key === formData.priority)?.label}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategorySelector = () => (
    <TouchableOpacity
      style={[styles.selectorButton, errors.category && styles.inputError]}
      onPress={() => setShowCategoryModal(true)}
    >
      <Text style={styles.selectorLabel}>Catégorie</Text>
      <View style={styles.selectorValue}>
        <Text style={styles.selectorIcon}>
          {categories.find(c => c.key === formData.category)?.icon}
        </Text>
        <Text style={styles.selectorText}>
          {categories.find(c => c.key === formData.category)?.label}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </View>
    </TouchableOpacity>
  );

  const renderOptionModal = (visible, setVisible, options, currentValue, onSelect, title) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  currentValue === item.key && styles.selectedOption
                ]}
                onPress={() => {
                  onSelect(item.key);
                  setVisible(false);
                }}
              >
                <Text style={styles.optionIcon}>{item.icon}</Text>
                <Text style={[
                  styles.optionText,
                  currentValue === item.key && styles.selectedOptionText
                ]}>
                  {item.label}
                </Text>
                {currentValue === item.key && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <Text style={styles.title}>Nouveau Ticket d'Incident</Text>
        <Text style={styles.subtitle}>
          Décrivez précisément le problème rencontré
        </Text>

        {/* Titre */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Titre du problème *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Ex: Problème de connexion au serveur"
            value={formData.title}
            onChangeText={(text) => {
              setFormData({ ...formData, title: text });
              if (errors.title) setErrors({ ...errors, title: null });
            }}
            maxLength={100}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          <Text style={styles.charCount}>{formData.title.length}/100</Text>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description détaillée *</Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            placeholder="Décrivez le problème en détail : quand cela se produit-il ? quelles sont les étapes pour le reproduire ? quel est l'impact ?"
            value={formData.description}
            onChangeText={(text) => {
              setFormData({ ...formData, description: text });
              if (errors.description) setErrors({ ...errors, description: null });
            }}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          <Text style={styles.charCount}>{formData.description.length}/500</Text>
        </View>

        {/* Priorité */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Priorité</Text>
          {renderPrioritySelector()}
        </View>

        {/* Catégorie */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Catégorie</Text>
          {renderCategorySelector()}
        </View>

        {/* Informations utilisateur */}
        <View style={styles.userInfo}>
          <Text style={styles.userInfoLabel}>Créé par :</Text>
          <Text style={styles.userInfoText}>
            {user?.firstName} {user?.lastName} ({user?.email})
          </Text>
        </View>

        {/* Bouton de soumission */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Créer le ticket</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modals pour sélection */}
      {renderOptionModal(
        showPriorityModal,
        setShowPriorityModal,
        priorities,
        formData.priority,
        (value) => setFormData({ ...formData, priority: value }),
        'Sélectionner la priorité'
      )}

      {renderOptionModal(
        showCategoryModal,
        setShowCategoryModal,
        categories,
        formData.category,
        (value) => setFormData({ ...formData, category: value }),
        'Sélectionner la catégorie'
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  form: {
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  inputError: {
    borderColor: '#e74c3c'
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5
  },
  charCount: {
    textAlign: 'right',
    color: '#7f8c8d',
    fontSize: 12,
    marginTop: 5
  },
  selectorButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  selectorLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5
  },
  selectorValue: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectorIcon: {
    fontSize: 20,
    marginRight: 10
  },
  selectorText: {
    fontSize: 16,
    flex: 1,
    color: '#2c3e50'
  },
  chevron: {
    fontSize: 12,
    color: '#7f8c8d'
  },
  userInfo: {
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30
  },
  userInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5
  },
  userInfoText: {
    fontSize: 14,
    color: '#34495e'
  },
  submitButton: {
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  disabledButton: {
    backgroundColor: '#bdc3c7'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50'
  },
  modalClose: {
    fontSize: 24,
    color: '#7f8c8d'
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa'
  },
  selectedOption: {
    backgroundColor: '#e3f2fd'
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 15
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    color: '#2c3e50'
  },
  selectedOptionText: {
    fontWeight: '600',
    color: '#3498db'
  },
  checkmark: {
    fontSize: 18,
    color: '#3498db',
    fontWeight: 'bold'
  }
});

export default CreateTicketForm;