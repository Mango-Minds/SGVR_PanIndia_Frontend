import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const GodCard = ({ god, navigation }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: god.image }} style={styles.godImage} />
      <Text style={styles.godName}>{god.name}</Text>
      <Text style={styles.godDescription}>{god.description}</Text>
      <FlatList
        data={god.temples}
        horizontal
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.templeCard}>
            <Image source={{ uri: item.image }} style={styles.templeImage} />
            <Text style={styles.templeName}>{item.name}</Text>
            <Text style={styles.templeLocation}>{item.location}</Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.moreInfoButton}
        onPress={() => navigation.navigate('Details', { god })}
      >
        <Text style={styles.moreInfoButtonText}>More Info</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  godImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  godName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  godDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  templeCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    width: 150,
  },
  templeImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  templeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  templeLocation: {
    fontSize: 14,
    color: '#777',
  },
  moreInfoButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  moreInfoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GodCard;
