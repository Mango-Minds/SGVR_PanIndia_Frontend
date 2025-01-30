import React from "react";
import { SafeArea } from "../../components/utility/safe-area.component";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Text,
  ActivityIndicator,
} from "react-native";
import { TopText } from "../../styles/social.styles";
import { RowBetween, SearchField } from "../../styles/common.styles";
import { IconButton } from "react-native-paper";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { viewMembers } from "../../services/community.services";
import CommunityMemberCard from "../../components/community/communityMemberCard";

const CommunityMemberScreen = ({ route, navigation }) => {
  const { id } = route.params;
  // const id = "6241651b6709f33d7461be73";

  // const { data, isloading } = useQuery(
  //   ["view-members"],
  //   () => viewMembers(id),
  //   {
  //     onSuccess: (data) => {
  //     //     },
  //   }
  // );
  const [isloading, setIsloading] = React.useState(true);
  const [data, setData] = React.useState([]);
  const [subscription, setSubscription] = React.useState(true);

  React.useEffect(() => {
    if (subscription) {
      viewMembers(id).then((data) => {
        setData(data.data);
      });
    }
    return () => setSubscription(false);
  }, []);

  React.useEffect(() => {
    setIsloading(false);
  }, [data]);

  const [index, setIndex] = React.useState(0);
  const initialLayout = { width: Dimensions.get("window").width };

  const FirstRoute = () => (
    <View style={[styles.scene]}>
      {/* <Text>Hello</Text> */}
      {data.map((item) => {
        if (
          item.position !== "member" &&
          item.status === "accepted" &&
          item.userid !== null
        ) {
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CommunityMemberProfileScreen", {
                  navigation: navigation,
                  fname: item.userid.fname,
                  midname: item.userid.midname,
                  lname: item.userid.lname,
                  username: item.userid.username,
                  city: item.userid.city,
                  state: item.userid.state,
                  about: item.about,
                  workdone: item.workDone,
                  position: item.position,
                  phone: item.userid.phone,
                  email: item.userid.email,
                  dob: item.userid.dob,
                  address: item.userid.address,
                  country: item.userid.country,
                  pincode: item.userid.pincode,
                  createdAt: item.createdAt,
                })
              }
            >
              <CommunityMemberCard
                key={item._id}
                name={item.userid?.fname + " " + item.userid?.lname}
                title={item.position}
                imgStyle={{
                  borderRadius: 4,
                  width: 52,
                  height: 52,
                }}
                imgContainerStyle={{
                  width: "auto",
                }}
              />
            </TouchableOpacity>
          );
        }
      })}
    </View>
  );

  const SecondRoute = () => (
    <View style={[styles.scene]}>
      {/* <Text>Hello</Text> */}
      {data.map((item) => {
        if (item.position === "member" && item.status === "accepted") {
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CommunityMemberProfileScreen", {
                  navigation: navigation,
                  fname: item.userid.fname,
                  midname: item.userid.midname,
                  lname: item.userid.lname,
                  username: item.userid.username,
                  city: item.userid.city,
                  state: item.userid.state,
                  about: item.about,
                  workdone: item.workDone,
                  position: item.position,
                  phone: item.userid.phone,
                  email: item.userid.email,
                  dob: item.userid.dob,
                  address: item.userid.address,
                  country: item.userid.country,
                  pincode: item.userid.pincode,
                  createdAt: item.createdAt,
                })
              }
            >
              <CommunityMemberCard
                key={item._id}
                name={item.userid.fname + " " + item.userid.lname}
                title={item.position}
                imgStyle={{
                  borderRadius: 4,
                  width: 52,
                  height: 52,
                }}
                imgContainerStyle={{
                  width: "auto",
                }}
              />
            </TouchableOpacity>
          );
        }
      })}
    </View>
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
  });

  const [routes] = React.useState([
    { key: "first", title: "Committee Members" },
    { key: "second", title: "Community Members" },
  ]);

  const handleSearch = () => {
    alert("Searching");
  };
  if (isloading) {
    return <ActivityIndicator style={{ display: "flex", flex: 1 }} />;
  } else {
    return (
      <SafeArea>
        <RowBetween>
          <View style={styles.header}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <TopText
              style={{ color: "#000000", fontSize: 20, fontWeight: "bold" }}
            >
              Community Members
            </TopText>
          </View>
        </RowBetween>
        {/* <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
          <SearchField
            placeholder="Search for community Members"
            onChangeText={handleSearch}
          />
          <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
            <TouchableOpacity>
              <Icon name="magnify" size={24} />
            </TouchableOpacity>
          </View>
        </Row> */}

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={initialLayout}
          style={styles.container}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              renderLabel={({ route }) => (
                <Text
                  style={{ color: "#B88B13", fontWeight: "500", margin: 8 }}
                >
                  {route.title}
                </Text>
              )}
              indicatorStyle={{ backgroundColor: "#D4AF37" }}
              style={{ backgroundColor: "white" }}
            />
          )}
        />
      </SafeArea>
    );
  }
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  scene: {
    flex: 1,
  },
});
export default CommunityMemberScreen;
