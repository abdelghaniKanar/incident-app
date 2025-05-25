import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

const TicketCard = ({ ticket, onPress, userRole }) => {
  const getPriorityConfig = (priority) => {
    const configs = {
      low: { color: '#28a745', bg: '#d4edda', icon: '🟢', label: 'Faible' },
      medium: { color: '#ffc107', bg: '#fff3cd', icon: '🟡', label: 'Moyen' },
      high: { color: '#fd7e14', bg: '#ffeaa7', icon: '🟠', label: 'Élevé' },
      urgent: { color: '#dc3545', bg: '#f8d7da', icon: '🔴', label: 'Urgent' }
    };
    return configs[priority] || configs.medium;
  };

  const getStatusConfig = (status) => {
    const configs = {
      open: { color: '#17a2b8', bg: '#d1ecf1', label: 'Ouvert' },
      'in-progress': { color: '#007bff', bg: '#cce5ff', label: 'En cours' },
      resolved: { color: '#28a745', bg: '#d4edda', label: 'Résolu' },
      closed: { color: '#6c757d', bg: '#e2e3e5', label: 'Fermé' }
    };
    return configs[status] || configs.open;
  };

  const getCategoryConfig = (category) => {
    const configs = {
      bug: { icon: '🐛', label: 'Bug' },
      hardware: { icon: '🖥️', label: 'Matériel' },
      software: { icon: '💻', label: 'Logiciel' },
      network: { icon: '🌐', label: 'Réseau' },
      other: { icon: '❓', label: 'Autre' }
    };
    return configs[category] || configs.other;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Aujourd\'hui';
    } else if (diffDays === 2) {
      return 'Hier';
    } else if (diffDays <= 7) {
      return `Il y a ${diffDays - 1} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }
  };

  const truncateText = (text, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const priorityConfig = getPriorityConfig(ticket.priority);
  const statusConfig = getStatusConfig(ticket.status);
  const categoryConfig = getCategoryConfig(ticket.category);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        ticket.priority === 'urgent' && styles.urgentCard
      ]}
      onPress={() => onPress(ticket)}
      activeOpacity={0.7}
    >
      {/* Header avec priorité et statut */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.bg }]}>
            <Text style={styles.priorityIcon}>{priorityConfig.icon}</Text>
            <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
              {priorityConfig.label}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.rightHeader}>
          <Text style={styles.ticketId}>#{ticket._id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.date}>{formatDate(ticket.createdAt)}</Text>
        </View>
      </View>

      {/* Titre et catégorie */}
      <View style={styles.titleSection}>
        <View style={styles.categoryIcon}>
          <Text style={styles.categoryEmoji}>{categoryConfig.icon}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {ticket.title}
          </Text>
          <Text style={styles.category}>{categoryConfig.label}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {truncateText(ticket.description)}
      </Text>

      {/* Footer avec informations utilisateur */}
      <View style={styles.footer}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>
              {ticket.createdBy?.firstName?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}
            </Text>
            <Text style={styles.userRole}>Créateur</Text>
          </View>
        </View>

        {/* Assignation (si applicable) */}
        {ticket.assignedTo && (
          <View style={styles.assignedInfo}>
            <Text style={styles.assignedLabel}>Assigné à :</Text>
            <Text style={styles.assignedName}>
              {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
            </Text>
          </View>
        )}

        {/* Indicateur de commentaires */}
        {ticket.comments && ticket.comments.length > 0 && (
          <View style={styles.commentsIndicator}>
            <Text style={styles.commentsIcon}>💬</Text>
            <Text style={styles.commentsCount}>{ticket.comments.length}</Text>
          </View>
        )}
      </View>

      {/* Barre de progression basée sur le statut */}
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar,
            { 
              width: ticket.status === 'open' ? '25%' : 
                    ticket.status === 'in-progress' ? '60%' : 
                    ticket.status === 'resolved' ? '90%' : '100%',
              backgroundColor: statusConfig.color
            }
          ]}
        />
      </View>

      {/* Indicateur urgent */}
      {ticket.priority === 'urgent' && (
        <View style={styles.urgentIndicator}>
          <Text style={styles.urgentText}>URGENT</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#e9ecef'
  },
  urgentCard: {
    borderLeftColor: '#dc3545',
    shadowColor: '#dc3545',
    shadowOpacity: 0.2
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  leftHeader: {
    flexDirection: 'row',
    flex: 1
  },
  rightHeader: {
    alignItems: 'flex-end'
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8
  },
  priorityIcon: {
    fontSize: 12,
    marginRight: 4
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  ticketId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6c757d',
    fontFamily: 'monospace'
  },
  date: {
    fontSize: 11,
    color: '#adb5bd',
    marginTop: 2
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  categoryEmoji: {
    fontSize: 16
  },
  titleContainer: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    lineHeight: 22,
    marginBottom: 4
  },
  category: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500'
  },
  description: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 20,
    marginBottom: 16
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  userInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  userDetails: {
    flex: 1
  },
  userName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2c3e50'
  },
  userRole: {
    fontSize: 11,
    color: '#7f8c8d'
  },
  assignedInfo: {
    alignItems: 'flex-end'
  },
  assignedLabel: {
    fontSize: 10,
    color: '#7f8c8d'
  },
  assignedName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2c3e50'
  },
  commentsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10
  },
  commentsIcon: {
    fontSize: 12,
    marginRight: 2
  },
  commentsCount: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6c757d'
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: 2
  },
  urgentIndicator: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  urgentText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5
  }
});

export default TicketCard;