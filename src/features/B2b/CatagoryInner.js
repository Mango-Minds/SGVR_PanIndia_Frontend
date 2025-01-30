import React, { useState } from "react";
import { View , Text , Image , TouchableOpacity , StyleSheet , ScrollView , Dimensions , FlatList , ActivityIndicator , Alert, SafeAreaView, Pressable} from "react-native";
import HeaderBar from "../../components/B2b/HeaderBar";
import { useNavigation } from "@react-navigation/native";
import { Searchbar , Divider} from "react-native-paper";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Sofa from '../../assets/images/B2b/sofa.png'
import { Container } from "../../styles/common.styles";
import UsedProduct from "../../components/B2b/UsedProduct";
import NewProduct from "../../components/B2b/NewProduct";
import LookingForProduct from "../../components/B2b/Lookingfor";




const CatagoryInner = () => {
    const navigation = useNavigation();
    const [Screen , setScreen] = useState("Used Product");
   
    return(
        <Container
        style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
      >
        <SafeAreaView style={{flex:1 , backgroundColor : "white"}}>
            <HeaderBar title="Furniture"/>
           <View style={{
                paddingHorizontal : 15,
                paddingVertical : 10,
           }}>
            <View style={{
                flexDirection : "row",
                justifyContent : "space-between",
                alignItems : "center",
                marginBottom : 10,
            }}>
            <View style={{
          width: '85%',
                   }}>
    <Searchbar placeholder="Search" style={{backgroundColor : "#F8F8F8" , shadowColor : "white" , fontSize : 13}}/>
            </View>
            <Pressable>
            <MaterialCommunityIcons name="filter" size={30} color="#D4AF37" style={{
                backgroundColor : "#F8F8F8",
                padding : 9,
                borderRadius : 50,
            }}/>
            </Pressable>
            </View>
            <View style={{
                flexDirection : "row",
                justifyContent : "space-between",
                alignItems : "center",
                marginBottom : 10,
                marginTop : 10,
            }}>
              <TouchableOpacity onPress={() => setScreen("Used Product")}>
                <View style={{
                    borderBottomColor : Screen === "Used Product" ? "#D4AF37" : "white",
                    borderBottomWidth : 2,
                    padding : 10,
                   marginBottom : 10,
                    marginTop : 10,
                }}>
                  <Text style={{
                    fontSize : 15,
                    fontWeight : "600",
                    color : Screen === "Used Product" ? "#D4AF37" : "#9C9C9C",
                  }}>Used Products</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setScreen("New Product")}>
                <View style={{
                    borderBottomColor : Screen === "New Product" ? "#D4AF37" : "white",
                    borderBottomWidth : 2,
                    padding : 10,
                    marginBottom : 10,
                    marginTop : 10,

                }}>
                   <Text style={{
                    fontSize : 15,
                    fontWeight : "600",
                    color : Screen === "New Product" ? "#D4AF37" : "#9C9C9C",

                   }}>New Products</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setScreen("Looking for")}>
                <View style={{
                    borderBottomColor : Screen === "Looking for" ? "#D4AF37" : "white",
                    borderBottomWidth : 2,
                    padding : 10,
                    marginBottom : 10,
                    marginTop : 10,
                }}>
                  <Text style={{
                    fontSize : 15,
                    fontWeight : "600",
                    color : Screen === "Looking for" ? "#D4AF37" : "#9C9C9C",

                  }}>Looking For</Text>
                </View>
              </TouchableOpacity>
            </View>
            {
              Screen == "Used Product" ? <UsedProduct /> : Screen === "New Product" ? <NewProduct /> : <LookingForProduct />
            } 

           </View>
        </SafeAreaView>
        </Container>
    )
}

export default CatagoryInner;

const styles = StyleSheet.create({})