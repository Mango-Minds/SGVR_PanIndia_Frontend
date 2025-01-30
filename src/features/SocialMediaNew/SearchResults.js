import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SearchField } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/Ionicons";
import { debounce } from "lodash";
import { BASEAPIURL } from '../../infrastructure/constants';
import { useSelector } from 'react-redux';


const suggestedUsers = [
  { id: '1', name: 'John Doe', designation: 'Software Engineer', avatar: 'https://via.placeholder.com/40' },
  { id: '2', name: 'Jane Smith', designation: 'Product Manager', avatar: 'https://via.placeholder.com/40' },
  { id: '3', name: 'Emily Johnson', designation: 'Designer', avatar: 'https://via.placeholder.com/40' },
  { id: '4', name: 'Michael Brown', designation: 'Data Scientist', avatar: 'https://via.placeholder.com/40' },
  { id: '5', name: 'Sarah Davis', designation: 'UX Researcher', avatar: 'https://via.placeholder.com/40' },
];



const SearchResults = () => {
  const searchInputRef = useRef(null);
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus(); // Focus the input field
    }
  }, []);
  const navigation = useNavigation();

  const renderUser = ({ item }) => (
    <TouchableOpacity style={styles.userItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userDesignation}>{item.designation}</Text>
      </View>
    </TouchableOpacity>
  );

  const token = useSelector((state) => state.user.token);
  const [loadingAnimation, setLoadingAnimation] = useState(false);



  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (e) => {
    setSearchTerm(e);
  };
  const debouncedFetchUsers = useCallback(
    debounce((searchTerm) => {
      fetchUsers(searchTerm);
    }, 1200),
    []
  );
  useEffect(() => {
    debouncedFetchUsers(searchTerm);
  }, [searchTerm]);

  const fetchUsers = async (searchTerm) => {
    const queryParams = new URLSearchParams();
  
    if (searchTerm.trim() !== "") {
      queryParams.append("search", searchTerm);
    }
  
    const queryString = queryParams.toString();
    const url = `${BASEAPIURL}/users?${queryString}`;
  
    console.log("Fetching users with URL:", url);
  
    try {
      setLoadingAnimation(true);
      // const response = await fetch(url, {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Users Data:", data);
  
        setUsers(data.data);
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingAnimation(false); // End loading
    }
  };
  


  return (
    <View style={styles.container}>
     <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon
            name="arrow-back"
            size={24}
            color="#000"
            onPress={() => navigation.goBack()}
          />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <SearchField placeholder="Search" style={styles.searchField}
              onChangeText={handleSearch} 
              onFocus={() => navigation.navigate('SearchResults')}
              ref={searchInputRef}
          />
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="settings" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={suggestedUsers}
        renderItem={renderUser}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    marginTop: 30,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
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
    borderRadius: 0, // Removes rounded corners
  },
  searchField: {
    height: 40,
    width: "100%",
    backgroundColor: "#eeeeee",
    paddingHorizontal: 15,
    marginHorizontal: 10,
    fontSize: 16,
    borderRadius: 0, // Removes rounded corners
  },
  list: {
    paddingBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 30, // Makes the avatar round
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDesignation: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: "#D3D3D3", // Light grey color
    marginVertical: 10, 
    marginHorizontal: 16, // optional for left/right padding
  },
});

export default SearchResults;
