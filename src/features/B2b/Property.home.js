import React from "react";
import {
    View,
    Text,
    SafeAreaView,
    Image,
    TouchableOpacity,
    ScrollView,
    FlatList,
} from "react-native";
import {
    Menu,
    Provider,
    } from "react-native-paper";
  import {
   MenuLead,
   } from "../../styles/prelogin.styles";
  import { useNavigation } from "@react-navigation/native";
import PropertyCard from "../../components/B2b/PropertyCard";
import Prop1 from '../../assets/images/B2b/prop1.png'
import Prop2 from '../../assets/images/B2b/prop2.png'
import Prop3 from '../../assets/images/B2b/prop3.png'
import Prop4 from '../../assets/images/B2b/prop4.png'

const PropertyHome = () => {
    const navigation = useNavigation();
    const [visible, setVisible] = React.useState(false);
    const [registerDetails, setRegisterDetails] = React.useState("Home");

    const proparty = [
        {
            Name: "Omax City I",
            Image: Prop1,
            id : 1,
            city : "Bangalore",
            price : "₹1,00,000",
            propertytype : "Apartment",
        },
        {
            Name: "Omax City II",
            Image: Prop2,
            id : 2,
            city : "Bangalore",
            price : "₹1,00,000",
            propertytype : "Apartment",
        },
        {
            Name: "Omax City III",
            Image: Prop3,
            id : 3,
            city : "Bangalore",
            price : "₹1,00,000",
            propertytype : "Apartment",
        },
        {
            Name: "Omax City IV",
            Image: Prop4,
            id : 4,
            city : "Bangalore",
            price : "₹1,00,000",
            propertytype : "Apartment",
        },
        {
          Name: "Omax City IV",
          Image: Prop4,
          id : 5,
          city : "Bangalore",
          price : "₹1,00,000",
          propertytype : "Apartment",
      },

    ]
            


    const MenuItem = (props) => {
        return (
          <Menu.Item
            style={{
              width: "100%",
            }}
            titleStyle={{
              fontSize: 14,
              color: "#656565",
              fontWeight: "500",
            }}
            onPress={() => {
              props.setRegisterDetails({
                ...props.allValues,
                [props.name]: props.value,
              });
              props.setVisible(false);
            }}
            title={props.value}
          />
        );
      };
    return(
        <Provider>
        <SafeAreaView style={{flex:1 , backgroundColor : "white"}}>
        <View style={{
            paddingHorizontal : 20,
            paddingVertical : 15,
           }}>
              <TouchableOpacity style={{
                backgroundColor : '#8B8B8B0D',
                paddingHorizontal : 15,
                paddingVertical : 10,
                borderRadius : 10,
                marginBottom : 10,
                width : '50%',
                borderColor : "#8B8B8B",
                borderWidth : 1,
              }} onPress={()=> navigation.navigate("PropertyLookingfor")}>
                <Text style={{
                    fontSize : 15,
                    fontWeight : '500',
                    color : "#8B8B8B",
                    textAlign : 'center',
                }}>Looking For</Text>
                </TouchableOpacity>  
                <View style={{ paddingHorizontal: 0}}>
              <Menu
                style={{
                  width: "80%",
                  // height: 50,
                  marginTop: -60,
                  color: "#9B9B9B",
                }}
                visible={visible}
                onDismiss={() => setVisible(false)}
                anchor={
                  <MenuLead
                    onPress={() => {
                      setVisible(true);
                    }}
                    style={{ height: 50 }}
                    title={registerDetails.lookingFor || "looking For *"}
                    bgColor="#F0F0F0"
                    textcolor="Looking For *"
                  />
                }
              >
                <MenuItem
                  name="lookingFor"
                  value="Rental Property"
                  setVisible={setVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="lookingFor"
                  value="Sale Property"
                  setVisible={setVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="lookingFor"
                  value="Lease Property"
                  setVisible={setVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
              </Menu>
            </View>
            <View style={{
                paddingVertical : 20,
                height : "100%",
            }}>
          <FlatList
            data={proparty}
            renderItem={({ item }) => (
            
               <PropertyCard  items={item}/>
            
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          </View>
          </View> 
        </SafeAreaView>
        </Provider>
    )
}

export default PropertyHome;

