import React from "react";
import { View , Text , StyleSheet , Image , TouchableOpacity , SafeAreaView} from "react-native";
import {
    Container,
    RowBetween,
    SearchField,
   } from "../../styles/common.styles";
import { IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import Profile from '../../assets/images/B2b/profile.png'
import { Row } from "../../styles/dashboard.styles";
import { debounce } from "lodash";
import Icon from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";


const Tools = () => {
    const navigation = useNavigation();
    return(
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: '#fff',
        }}>
             <View style={{
            paddingHorizontal: 10,
        }}>
        <RowBetween style={{ paddingTop: 24 }}>
          <View style={{ alignItems: "center" , flexDirection : "row"}}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <TopText
              style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
            >
              Tools
            </TopText>
          </View>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",

          }}>
            <TouchableOpacity onPress={() => navigation.navigate('ToolsProfile')}>
            <Image source={Profile}  style={{width : 35 , height : 35 , marginRight : 10}}/>
            </TouchableOpacity>
            
          <IconButton
            icon="bell-outline"
            style={{ marginLeft: "auto" }}
          ></IconButton>
            </View>
        </RowBetween>
        </View>
        <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
          <SearchField placeholder="Search"  />
          <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
            <Icon name="search" size={24} />
          </View>
        </Row>
        <View>
        <ScrollView style={{ marginTop: "1%" }}>
     <TouchableOpacity onPress={() => navigation.navigate("ToolsProductDetails")}>
            <View
              style={[
                styles.shadowProp,
                {
                  padding: "4%",
                  margin: "2%",
                  display: "flex",
                  flexDirection: "row",
                },
              ]}
            >
              <Image
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 8,
                    opacity: 0.6,
                  }}
                  source={{
                    uri: "https://img.icons8.com/officel/344/jewelry.png",
                  }}
                ></Image>
             <View style={{ flexDirection: "column", marginLeft: "4%" }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    opacity: 0.7,
                    marginLeft: "2%",
                    marginTop: "2%",
                    fontSize: 17,
                  }}
                >
                  {/* {shop?.name} */}
                  GemsStone Name
                </Text>
                <View style={{ flexDirection: "column", marginTop: "10%" }}>
                  <View style={{ marginTop: "2%" , flexDirection : "row"}}>
                    <Icon
                      style={{ opacity: 0.4, marginTop: "2%" }}
                      name="md-location-sharp"
                      size={14}
                    />
                    <Text
                      style={{
                        fontWeight: "600",
                        marginTop: "1%",
                        opacity: 0.7,
                      }}
                    >
                      {/* {shop?.city} */}
                      New York
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontWeight: "500",
                      opacity: 0.4,
                      marginLeft: "3%",
                        marginTop: "4%",
                    }}
                  >
                    {/* {shop?.address[0]} */}
                    5th Avenue, New York
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
       
        <View>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              marginTop: "40%",
              opacity: 0.1,
            }}
          >
            <Image
              style={{ width: 120, height: 120 }}
              source={{
                uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTGyDvGz4KeBYxqA5KtqiIg6bx1y4m9XObHwQPMxxS917Y3fbGJSw8-BvPVuz0qx0rXhM&usqp=CAU",
              }}
            />
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              No Tools found
            </Text>
          </View>
        </View>
     </ScrollView>
        </View>

        </SafeAreaView>
    )
}

export default Tools;

const styles = StyleSheet.create({
    shadowProp: {
        backgroundColor: "white",
        borderRadius: 6,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1.41,
    
        elevation: 2,
      },
})