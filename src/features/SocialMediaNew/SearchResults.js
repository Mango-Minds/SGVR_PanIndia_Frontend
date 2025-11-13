import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchField } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/Ionicons";
import { debounce } from "lodash";
import { useSelector } from 'react-redux';
import { getSearchUsers } from '../../services/socialMedia.services';

const SearchResults = () => {
  const searchInputRef = useRef(null);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [loadingAnimation, setLoadingAnimation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearch = (text) => {
    setSearchTerm(text);
    setError(null);
  };

  const fetchUsers = useCallback(async (searchText) => {
    if (!searchText || searchText.trim().length < 2) {
      setUsers([]);
      return;
    }

    try {
      setLoadingAnimation(true);
      setError(null);
      
      const response = await getSearchUsers({ searchTerm: searchText.trim() });
      
      if (response.status === 0) {
        console.log("Search results:", response.profiles?.length || 0, "users found");
        setUsers(response.profiles || []);
      } else {
        console.error("Search failed:", response.message);
        setError(response.message || "Search failed");
        setUsers([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Network error. Please try again.");
      setUsers([]);
    } finally {
      setLoadingAnimation(false);
    }
  }, []);

  const debouncedFetchUsers = useCallback(
    debounce((searchText) => {
      fetchUsers(searchText);
    }, 800),
    [fetchUsers]
  );

  useEffect(() => {
    if (searchTerm.length >= 2) {
      debouncedFetchUsers(searchTerm);
    } else if (searchTerm.length === 0) {
      setUsers([]);
      setError(null);
    }

    // Cleanup function to cancel debounced calls
    return () => {
      debouncedFetchUsers.cancel();
    };
  }, [searchTerm, debouncedFetchUsers]);

  const handleUserPress = (userId) => {
    try {
      console.log("Navigating to user profile:", userId);
      navigation.navigate('EachProfile', { userId });
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Unable to open user profile. Please try again.");
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => {
        navigation.navigate('EachProfile', { userId: item._id });
      }}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/50' }} 
        style={styles.avatar} 
        defaultSource={require('../../assets/images/general/user.png')}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: Platform.OS === 'ios' ? Math.max(insets.top, 8) : Platform.OS === 'android' ? 24 : 8 }]}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search users..."
            style={styles.searchField}
            onChangeText={handleSearch} 
            value={searchTerm}
            ref={searchInputRef}
            returnKeyType="search"
          />
        </View>
      </View>
      
      {loadingAnimation ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            searchTerm.length > 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="search" size={50} color="#ccc" />
                <Text style={styles.emptyText}>No users found</Text>
                <Text style={styles.emptySubText}>Try searching with a different term</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="people" size={50} color="#ccc" />
                <Text style={styles.emptyText}>Search for users</Text>
                <Text style={styles.emptySubText}>Type at least 2 characters to search</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 8,
    backgroundColor: "#f8f8f8",
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    height: 40,
    width: "80%",
    marginHorizontal: 5,
    backgroundColor: "#eeeeee",
    justifyContent: "center",
    borderRadius: 0,
  },
  searchField: {
    height: 40,
    width: "100%",
    backgroundColor: "#eeeeee",
    paddingHorizontal: 15,
    marginHorizontal: 10,
    fontSize: 16,
    borderRadius: 0,
  },
  list: {
    paddingBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  separator: {
    height: 1,
    backgroundColor: "#D3D3D3",
    marginVertical: 10,
    marginHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default SearchResults;
