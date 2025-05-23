import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import TicketCard from './components/TicketCard';

const demoData = [
  {
    id: '1',
    title: 'Problème de connexion',
    status: 'En attente',
    date: '2023-05-20',
    priority: 'Haute',
  },
  {
    id: '2',
    title: 'Écran cassé',
    status: 'En cours',
    date: '2023-05-18',
    priority: 'Urgent',
  },
  {
    id: '3',
    title: 'Clavier ne fonctionne pas',
    status: 'Résolu',
    date: '2023-05-15',
    priority: 'Moyenne',
  },
];

const Dashboard = () => {
  const [userRole, setUserRole] = useState('user');
  const [tickets, setTickets] = useState(demoData);
  const navigation = useNavigation();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setUserRole(role || 'user');
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    checkUserRole();
  }, []);

  const renderItem = ({ item }) => (
    <TicketCard
      ticket={item}
      onPressDetails={() => navigation.navigate('TicketDetails', { ticketId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('./assets/logo-404.png')} style={styles.logo} resizeMode="contain" />
        <View>
          <Text style={styles.userRoleText}>
            Connecté en tant que: {userRole === 'admin' ? 'Administrateur' : 'Utilisateur'}
          </Text>
        </View>
      </View>

      <View style={styles.roleButtonsContainer}>
        {userRole === 'admin' ? (
          <>
            <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('Filter')}>
              <Text style={styles.buttonText}>Filtrer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('Padding')}>
              <Text style={styles.buttonText}>Padding</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('All')}>
              <Text style={styles.buttonText}>Tous</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.userButton} onPress={() => navigation.navigate('AddTicket')}>
            <Ionicons name="add" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Ajouter Ticket</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.welcomeText}>
          {userRole === 'admin' ? 'Tableau de bord Administrateur' : 'Mes Tickets'}
        </Text>

        {userRole === 'admin' && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{tickets.filter(t => t.status === 'En attente').length}</Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{tickets.filter(t => t.status === 'En cours').length}</Text>
              <Text style={styles.statLabel}>En cours</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{tickets.filter(t => t.status === 'Résolu').length}</Text>
              <Text style={styles.statLabel}>Résolus</Text>
            </View>
          </View>
        )}

        <FlatList
          data={tickets}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          style={styles.ticketsList}
        />
      </ScrollView>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={24} color="white" />
          <Text style={styles.navText}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Tickets')}>
          <Ionicons name="ticket-outline" size={24} color="white" />
          <Text style={styles.navText}>Tickets</Text>
        </TouchableOpacity>
        {userRole === 'admin' && (
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AdminDashboard')}>
            <Ionicons name="settings-outline" size={24} color="white" />
            <Text style={styles.navText}>Admin</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'white' },
  logo: { width: 100, height: 40 },
  userRoleText: { fontSize: 12, color: '#666' },
  roleButtonsContainer: { flexDirection: 'row', justifyContent: 'center', padding: 10, backgroundColor: '#fff' },
  adminButton: { backgroundColor: '#6200ee', padding: 10, borderRadius: 20, marginHorizontal: 5 },
  userButton: { backgroundColor: '#6200ee', padding: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  buttonIcon: { marginRight: 8 },
  content: { flex: 1, padding: 15 },
  welcomeText: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { backgroundColor: 'white', borderRadius: 10, padding: 15, width: '30%', alignItems: 'center', elevation: 3 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#6200ee' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 5 },
  ticketsList: { marginBottom: 20 },
  navbar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#6200ee', paddingVertical: 10 },
  navItem: { alignItems: 'center' },
  navText: { color: 'white', fontSize: 12, marginTop: 2 },
});

export default Dashboard;
