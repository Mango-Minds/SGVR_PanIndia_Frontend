import React from 'react';
import { View , Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
import Sofa from '../../assets/images/B2b/sofa.png';
import { useNavigation } from '@react-navigation/native';


const UsedProduct = () => {
    const navigation = useNavigation();
    const Used_Product = [
        {
            id: 1,
            product_name: "Used Product",
            product_image: Sofa,
            product_price: "Rs. 1000",
            product_description: "Used Product",
            location: "Mumbai",
            category: "Used Product",
            product_id: 1,
        },
        {
            id: 2,
            product_name: "Used Product",
            product_image: Sofa,
            product_price: "Rs. 1000",
            product_description: "Used Product",
            location: "Mumbai",
            category: "Used Product",
            product_id: 2,
        },
        {
            id: 3,
            product_name: "Used Product",
            product_image: Sofa,
            product_price: "Rs. 1000",
            product_description: "Used Product",
            location: "Mumbai",
            category: "Used Product",
            product_id: 3,
            
        },
        {
            id: 4,
            product_name: "Used Product",
            product_image: Sofa,
            product_price: "Rs. 1000",
            product_description: "Used Product",
            location: "Mumbai",
            category: "Used Product",
            product_id: 3,
            
        },
        {
            id: 5,
            product_name: "Used Product",
            product_image: Sofa,
            product_price: "Rs. 1000",
            product_description: "Used Product",
            location: "Mumbai",
            category: "Used Product",
            product_id: 3,
            
        },
        {
            id: 6,
            product_name: "Used Product",
            product_image: Sofa,
            product_price: "Rs. 1000",
            product_description: "Used Product",
            location: "Mumbai",
            category: "Used Product",
            product_id: 3,
            
        },
        {
            id: 7,
            product_name: "Used Product",
            product_image: Sofa,
            product_price: "Rs. 1000",
            product_description: "Used Product",
            location: "Mumbai",
            category: "Used Product",
            product_id: 3,
            
        },

    ]
   return (
   <View style={{
   
    }}>
<FlatList 
contentContainerStyle={{
   flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
}}
            data={Used_Product}
            renderItem={({item}) => (
        <TouchableOpacity onPress={item.product_id} style={{
            width: Dimensions.get('window').width / 2 - 20,
            
        }}>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image source={item.product_image} style={styles.image} />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{item.product_name}</Text>
                    <Text style={styles.price}>{item.product_price}</Text>
                    <Text style={styles.description}>View Details</Text>
                </View>
            </View>
        </TouchableOpacity>
        )}
            keyExtractor={item => item.id.toString()}
        />
   </View>
 
   
       
    );
}

export default UsedProduct;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        marginVertical: 5,
        borderRadius: 5,
        backgroundColor: '#fff',
        shadowColor: '#0000001A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
        paddingHorizontal: 5,
        paddingTop: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        width: "100%",
        
    },
   image: {
        width: "100%",
        height: 100,
        
        },
    infoContainer: {
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    name: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1C1D',
    },
    price: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1C1D',
        marginTop: 5,
    },
    description: {
        fontSize: 12,
        color: '#D4AF37',
        marginTop: 10,
        fontWeight: '600',
    }
});