import React from "react";
import { Text , View , Image, TouchableOpacity} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Divider, IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import Profile from '../../assets/images/B2b/profile.png'
import { Props } from "react-native-image-zoom-viewer/built/image-viewer.type";


const HeaderBar = ({title}) => {
    const navigation = useNavigation();
    return(
        <View style={{
            paddingHorizontal: 10,
            paddingTop: 25,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        }}>
        <View style={{ alignItems: "center" , flexDirection : "row"}}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <TopText
              style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
            >
              {title}
            </TopText>
          </View>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",

          }}>
            <TouchableOpacity /*onPress={() => navigation.navigate('MyProfile')}*/>
            <Image source={Profile}  style={{width : 35 , height : 35 , marginRight : 10}}/>
            </TouchableOpacity>
            
          <IconButton
            icon="bell-outline"
            style={{ marginLeft: "auto" }}
          ></IconButton>
          </View>
          
       </View>
    )
}


export default HeaderBar;
