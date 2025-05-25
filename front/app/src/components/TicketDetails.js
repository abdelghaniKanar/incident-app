import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ticketService } from '../services/api';

const TicketDetails = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const { user } = useContext(AuthContext);
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [updatingTicket, setUpdatingTicket] = useState(false);

  const statusOptions = [
    { key: 'open', label: 'Ouvert', color: '#17a2b8', icon: '📋' },
    { key: 'in-progress', label: 'En cours', color: '#007bff', icon: '⚙️' },
    { key: 'resolved', label: 'Résolu', color: '#28a745', icon: '✅' },
    { key: 'closed', label: 'Fermé', color: '#6c757d', icon: '🔒' }
  ];

  const priorityOptions = [
    { key: 'low', label: 'Faible', color: '#28a745', icon: '🟢' },
    { key: 'medium', label: 'Moyen', color: '#ffc107', icon: '🟡' },
    { key: 'high', label: 'Élevé', color: '#fd7e14', icon: '🟠' },
    { key: 'urgent', label: 'Urgent', color: '#dc3545', icon: '🔴' }
  ];

  useEffect(() => {
    loadTicketDetails();
  }, [ticketId]);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketById(ticketId);
      setTicket(response.data);
    } catch (error) {
      console.error('Erreur chargement ticket:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les détails du ticket',
        [{ text: 'Retour', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTicketDetails();
    setRefreshing(false);
  };

  const canEditTicket = () => {
    if (!ticket || !user) return false;
    return user.role === 'admin' || ticket.createdBy._id === user._id;
  };

  const canManageTicket = () => {
    return user?.role === 'admin';
  };

  const updateTicketField = async (field, value) => {
    if (!canEditTicket() && !canManageTicket()) return;

    try {
      setUpdatingTicket(true);
      const updateData = { [field]: value };
      const response = await ticketService.updateTicket(ticketId, updateData);
      setTicket(response.data);
      
      Alert.alert('Succès', 'Ticket mis à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le ticket');
    } finally {
      setUpdatingTicket(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      setAddingComment(true);
      const commentData = { content: newComment.trim() };
      const response = await ticketService.addComment(ticketId, commentData);
      setTicket(response.data);
      setNewComment('');
      
      Alert.alert('Succès', 'Commentaire ajouté');
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le commentaire');
    } finally {
      setAddingComment(false);
    }
  };

  const deleteTicket = async () => {
    if (!canManageTicket()) return;

    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await ticketService.deleteTicket(ticketId);
              Alert.alert('Succès', 'Ticket supprimé', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le ticket');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    return statusOptions.find(s => s.key === status) || statusOptions[0];
  };

  const getPriorityConfig = (priority) => {
    return priorityOptions.find(p => p.key === priority) || priorityOptions[1];
  };

  const getCategoryConfig = (category) => {
    const configs = {
      bug: { icon: '🐛', label: 'Bug / Défaut' },
      hardware: { icon: '🖥️', label: 'Matériel' },
      software: { icon: '💻', label: 'Logiciel' },
      network: { icon: '🌐', label: 'Réseau' },
      other: { icon: '❓', label: 'Autre' }
    };
    return configs[category] || configs.other;
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ticket non trouvé</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getStatusConfig(ticket.status);
  const priorityConfig = getPriorityConfig(ticket.priority);
  const categoryConfig = getCategoryConfig(ticket.category);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header avec actions */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.ticketId}>#{ticket._id.slice(-6).toUpperCase()}</Text>
          {canManageTicket() && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={deleteTicket}
            >
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Informations principales */}
      <View style={styles.mainInfo}>
        <View style={styles.titleSection}>
          <View style={styles.categoryIcon}>
            <Text style={styles.categoryEmoji}>{categoryConfig.icon}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{ticket.title}</Text>
            <Text style={styles.category}>{categoryConfig.label}</Text>
          </View>
        </View>

        {/* Badges de statut et priorité */}
        <View style={styles.badgesContainer}>
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}
            onPress={() => canManageTicket() && setShowStatusModal(true)}
          >
            <Text style={styles.badgeIcon}>{statusConfig.icon}</Text>
            <Text style={[styles.badgeText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
            {canManageTicket() && <Text style={styles.editIcon}>✎</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.priorityBadge, { backgroundColor: priorityConfig.color + '20' }]}
            onPress={() => canManageTicket() && setShowPriorityModal(true)}
          >
            <Text style={styles.badgeIcon}>{priorityConfig.icon}</Text>
            <Text style={[styles.badgeText, { color: priorityConfig.color }]}>
              {priorityConfig.label}
            </Text>
            {canManageTicket() && <Text style={styles.editIcon}>✎</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{ticket.description}</Text>
      </View>

      {/* Informations utilisateur */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Créé par</Text>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userInitial}>
                  {ticket.createdBy.firstName.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.userName}>
                  {ticket.createdBy.firstName} {ticket.createdBy.lastName}
                </Text>
                <Text style={styles.userEmail}>{ticket.createdBy.email}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Créé le</Text>
            <Text style={styles.infoValue}>{formatDate(ticket.createdAt)}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Dernière mise à jour</Text>
            <Text style={styles.infoValue}>{formatDate(ticket.updatedAt)}</Text>
          </View>

          {ticket.assignedTo && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Assigné à</Text>
              <View style={styles.userInfo}>
                <View style={[styles.userAvatar, styles.assignedAvatar]}>
                  <Text style={styles.userInitial}>
                    {ticket.assignedTo.firstName.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>
                    {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                  </Text>
                  <Text style={styles.userEmail}>{ticket.assignedTo.email}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Commentaires */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Commentaires ({ticket.comments?.length || 0})
        </Text>
        
        {ticket.comments && ticket.comments.length > 0 ? (
          ticket.comments.map((comment, index) => (
            <View key={index} style={styles.comment}>
              <View style={styles.commentHeader}>
                <View style={styles.commentUserAvatar}>
                  <Text style={styles.commentUserInitial}>
                    {comment.author.firstName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.commentInfo}>
                  <Text style={styles.commentAuthor}>
                    {comment.author.firstName} {comment.author.lastName}
                  </Text>
                  <Text style={styles.commentDate}>
                    {formatDate(comment.createdAt)}
                  </Text>
                </View>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noComments}>Aucun commentaire pour le moment</Text>
        )}

        {/* Ajouter un commentaire */}
        <View style={styles.addCommentSection}>
          <Text style={styles.addCommentLabel}>Ajouter un commentaire</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Votre commentaire..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[
              styles.addCommentButton,
              (!newComment.trim() || addingComment) && styles.disabledButton
            ]}
            onPress={addComment}
            disabled={!newComment.trim() || addingComment}
          >
            {addingComment ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.addCommentButtonText}>Ajouter</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Modals */}
      {renderOptionModal(
        showStatusModal,
        setShowStatusModal,
        statusOptions,
        ticket.status,
        (value) => updateTicketField('status', value),
        'Changer le statut'
      )}

      {renderOptionModal(
        showPriorityModal,
        setShowPriorityModal,
        priorityOptions,
        ticket.priority,
        (value) => updateTicketField('priority', value),
        'Changer la priorité'
      )}

      {updatingTicket && (
        <View style={styles.updatingOverlay}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.updatingText}>Mise à jour...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    marginBottom: 20
  },
  backButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  headerLeft: {
    flex: 1
  },
  backBtn: {
    padding: 8
  },
  backBtnText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ticketId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6c757d',
    fontFamily: 'monospace',
    marginRight: 12
  },
  deleteBtn: {
    padding: 8
  },
  deleteBtnText: {
    fontSize: 18
  },
  mainInfo: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  categoryEmoji: {
    fontSize: 20
  },
  titleContainer: {
    flex: 1
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    lineHeight: 26,
    marginBottom: 4
  },
  category: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500'
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 12
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flex: 1
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flex: 1
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 6
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1
  },
  editIcon: {
    fontSize: 12,
    color: '#7f8c8d'
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12
  },
  description: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24
  },
  infoGrid: {
    gap: 16
  },
  infoItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    paddingBottom: 12
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 8
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  assignedAvatar: {
    backgroundColor: '#28a745'
  },
  userInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50'
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d'
  },
  comment: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  commentUserAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  commentUserInitial: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  commentInfo: {
    flex: 1
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50'
  },
  commentDate: {
    fontSize: 12,
    color: '#7f8c8d'
  },
  commentContent: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20
  },
  noComments: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20
  },
  addCommentSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef'
  },
  addCommentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12
  },
  addCommentButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#bdc3c7'
  },
  addCommentButtonText: {
    color: '#fff',
    fontSize: 16,
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
  },
  updatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  updatingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#3498db'
  }
});

export default TicketDetails;