import { useEffect, useState } from "react";
import { Text, ScrollView, StyleSheet } from "react-native";
import api from "../api/api";

export default function TicketDetails({ route }) {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await api.get(`/tickets/${ticketId}`);
        setTicket(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchTicket();
  }, [ticketId]);

  if (!ticket) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{ticket.title}</Text>
      <Text style={styles.subtitle}>Requested by: {ticket.user?.name}</Text>
      <Text style={styles.subtitle}>Status: {ticket.status}</Text>
      <Text style={styles.label}>Request Details:</Text>
      <Text style={styles.text}>{ticket.request}</Text>
      {ticket.answer ? (
        <>
          <Text style={styles.label}>Answer:</Text>
          <Text style={styles.text}>{ticket.answer}</Text>
        </>
      ) : null}
      <Text style={styles.label}>Date:</Text>
      <Text style={styles.text}>{new Date(ticket.date).toLocaleString()}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 4 },
  label: { marginTop: 12, fontWeight: "bold" },
  text: { fontSize: 16, color: "#333" },
});
