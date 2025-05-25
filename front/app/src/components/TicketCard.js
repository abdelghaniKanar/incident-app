import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function TicketCard({ ticket, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{ticket.title}</Text>
      <Text numberOfLines={2} style={styles.request}>
        {ticket.request}
      </Text>
      <View style={styles.footer}>
        <View style={[styles.statusTag, getStatusStyle(ticket.status)]}>
          <Text style={styles.statusText}>{ticket.status}</Text>
        </View>
        <Text style={styles.date}>
          {new Date(ticket.date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const getStatusStyle = (status) => {
  switch (status) {
    case "pending":
      return { backgroundColor: "#f9c74f" };
    case "on review":
      return { backgroundColor: "#f3722c" };
    case "reviewed":
      return { backgroundColor: "#90be6d" };
    default:
      return { backgroundColor: "#ccc" };
  }
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 6,
    backgroundColor: "#fff",
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  request: { marginTop: 4, color: "#555" },
  footer: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  date: { color: "#888" },
});
