import React, { useState, useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Pressable,
  Image,
} from "react-native";
import { Badge, Divider, IconButton } from "react-native-paper";
import {
  Container,
  RowBetween,
  SearchField,
  View,
} from "../../styles/common.styles";
import { Row } from "../../styles/dashboard.styles";
import { TopText } from "../../styles/social.styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import CommunitySearchCard from "../../components/community/communitySearchCard";
import InfiniteScroll from "react-native-infinite-scrolling";
import CommunityCardNew from "./CommunityCardNew";
import { useDispatch, useSelector } from "react-redux";
import BottomNavigation from "../../components/community/BottomNavigation";

const STATIC_COMMUNITIES = [
  {
    _id: "1",
    name: "Community 1",
    isActive: true,
    imageUrl: "https://picsum.photos/3000",
    city: "City 1",
    state: "State 1",
  },
  {
    _id: "2",
    name: "Community 2",
    isActive: true,
    imageUrl: "https://picsum.photos/3000",
    city: "City 2",
    state: "State 2",
  },
  // Add more communities as needed
];

const STATIC_NOTIFICATIONS = [
  { id: "1", isRead: false, community: "Community 1" },
  { id: "2", isRead: false, community: "Community 2" },
  // Add more notifications as needed
];

export default function CommunitySearchScreenNew({ navigation }) {
  const dispatch = useDispatch();
  const { notification } = useSelector((state) => state.user);
  const [communitiesFound, setCommunitiesFound] = useState(STATIC_COMMUNITIES);
  const [communitiesSearched, setCommunitiesSearched] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [bellBadge, setBellBadge] = useState(0);

  useEffect(() => {
    const unreadCount = STATIC_NOTIFICATIONS.filter(
      (item) => !item.isRead
    ).length;
    setBellBadge(unreadCount);
  }, []);

  const handleSearch = (query) => {
    if (query.length > 0) {
      setSearching(true);
      setSearchComplete(false);
      const results = STATIC_COMMUNITIES.filter((community) =>
        community.name.toLowerCase().includes(query.toLowerCase())
      );
      setCommunitiesSearched(results);
      setSearchComplete(true);
    } else {
      setSearching(false);
      setSearchComplete(false);
    }
  };

  const renderCommunity = ({ item }) => {
    if (item.isActive) {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() =>
            navigation.navigate("CommunityProfileNew", {
              communityId: item._id,
            })
          }
        >
          <CommunityCardNew {...item} city={item.city} state={item.state} />
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText style={{ color: "#000", fontSize: 20, fontWeight: "bold" }}>
            Community
          </TopText>
        </View>
        <Pressable /* onPress={() => navigation.navigate("CommunityNotifications")}*/
        >
          <Ionicons
            style={{ opacity: 0.75, marginRight: 8 }}
            name="notifications"
            color="black"
            size={30}
          />
          {bellBadge > 0 && (
            <Badge
              style={{
                position: "absolute",
                right: 5,
                top: 0,
                fontSize: 10,
                fontWeight: "bold",
                backgroundColor: "#D80808",
              }}
              size={17}
            >
              {bellBadge}
            </Badge>
          )}
        </Pressable>
        <IconButton
          icon="account-circle"
          // onPress={() => navigation.navigate("MyProfile")}
          style={{ marginRight: "5%" }}
        />
      </RowBetween>
      <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
        <SearchField
          placeholder="Search Community"
          onChangeText={handleSearch}
        />
        <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
          <TouchableOpacity>
            <Ionicons name="search" size={24} />
          </TouchableOpacity>
        </View>
      </Row>
      <Divider />
      {!searching ? (
        communitiesFound.length > 0 ? (
          <InfiniteScroll
            renderData={renderCommunity}
            data={communitiesFound}
          />
        ) : (
          <View style={styles.noCommunityFound}>
            <Ionicons name="people" size={130} color="#848484" />
            <Text style={styles.noCommunityText}>No Community Found</Text>
          </View>
        )
      ) : (
        <>
          {communitiesSearched.length > 0 ? (
            communitiesSearched.map((community, index) => (
              <CommunitySearchCard community={community} key={index} />
            ))
          ) : searchComplete ? (
            <Row
              style={{
                alignItems: "center",
                marginTop: 16,
                justifyContent: "center",
              }}
            >
              <TopText style={{ fontSize: 16 }}>No communities found</TopText>
            </Row>
          ) : (
            <ActivityIndicator style={{ marginTop: 50 }} />
          )}
        </>
      )}
      <BottomNavigation navigation={navigation} />
    </Container>
  );
}

const styles = {
  noCommunityFound: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  noCommunityText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 0,
    marginBottom: 20,
    color: "#848484",
  },
};
