import React, { useCallback, useEffect, useState } from "react";
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
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import CommunitySearchCard from "../../components/community/communitySearchCard";
import {
  getImage,
  searchCommunity,
  viewCommunity,
} from "../../services/community.services";
import { useMutation } from "@tanstack/react-query";
import { debounce } from "lodash";
import InfiniteScroll from "react-native-infinite-scrolling";
import CommunityCard from "../../components/dashboard/CommunityCard";
import { useDispatch, useSelector } from "react-redux";
import { ErrorToggle } from "../../store/user";

export default function CommunitySearchScreen({ navigation }) {
  const dispatch = useDispatch();
  const { notification } = useSelector((state) => state.user);
  const [communitiesFound, setCommunitiesFound] = useState([]);
  const [communitiesImages, setCommunitiesImages] = useState([]);
  const [subs, setSubs] = useState(true);
  const [communitiesSeached, setCommunitiesSearched] = useState([]);
  const [page, setPage] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [bellbadge, setBellbadge] = useState(0);
  const searchCommunityMutation = useMutation(searchCommunity, {
    onSuccess: (data) => {
      setCommunitiesSearched(data.data);
      // setSearching(false);
      setSearchComplete(true);
    },
    onError: (err) => {
      dispatch(
        ErrorToggle({
          msg: err.response.data.message,
          type: "error",
          toggle: true,
        })
      );
    },
  });

  const SearchCommunities = async ({ searchTerm }) => {
    await searchCommunityMutation.mutateAsync({ searchTerm });
  };

  const searchDebounce = useCallback(debounce(SearchCommunities, 500), []);

  const handleSearch = (e) => {
    if (e.length > 0) {
      setSearching(true);
      setSearchComplete(false);
      searchDebounce({ searchTerm: e });
    } else {
      setSearching(false);
      setSearchComplete(false);
    }
  };

  // const getImageFromKey = async (key) => {
  //   const res = await getImage(key);
  //   return res;
  // };

  const viewCommunityMutation = useMutation(viewCommunity, {
    onSuccess: async (data) => {
      if (data.status === 0 && data.data.length > 0) {
        let currentCommunitiesFound = [...communitiesFound, ...data.data];
        let currentCommunitiesImages = [...communitiesImages, ...data.imageUrl];
        setCommunitiesFound(currentCommunitiesFound);
        setCommunitiesImages(currentCommunitiesImages);
      }
    },
    onError: (err) => {
      dispatch(
        ErrorToggle({
          msg: err.response.data.message,
          type: "error",
          toggle: true,
        })
      );
    },
  });

  const ViewCommunities = async ({ page, limit }) => {
    await viewCommunityMutation.mutateAsync({ page, limit });
  };

  const viewDebounce = useCallback(debounce(ViewCommunities, 500), []);

  const loadMore = async () => {
    setPage(page + 1);
    ViewCommunities({ page: page + 1, limit: 10 });
    // viewDebounce({ page: page + 1, limit: 10 });
  };

  useEffect(() => {
    if (subs) loadMore();
    return () => setSubs(false);
  }, []);

  useEffect(() => {
    let count = 0;
    for (let i = 0; i < notification.community.length; i++) {
      const item = notification.community[i];

      if (item.isRead === false) {
        count++;
      }
    }
    if (count > 0) {
      setBellbadge(count);
    } else {
      setBellbadge(0);
    }
  }, [notification]);

  const renderData = (data) => {
    if (data.item.isActive === true) {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            navigation.navigate("CommunityProfile", {
              communityId: data.item._id,
            });
          }}
          // key={(data.index).toString()}
        >
          <CommunityCard
            {...data.item}
            community={communitiesImages}
            idx={data.index}
            navigation={navigation}
          />
        </TouchableOpacity>
      );
    }
  };
  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{ color: "#000000", fontSize: 20, fontWeight: "bold" }}
          >
            Community
          </TopText>
        </View>
        {/* <TouchableOpacity onPress={() => navigation.navigate("Temple")}>
          <Image
            source={Temple}
            style={{ width: 35, height: 35, marginRight: 20 }}
          />
        </TouchableOpacity> */}
        <Pressable
          onPress={() => {
            navigation.navigate("CommunityNotifications");
          }}
        >
          <Ionicons
            style={{
              opacity: 0.75,
              marginRight: 8,
            }}
            name="notifications"
            color="black"
            size={30}
          />
          {bellbadge > 0 && (
            <Badge
              style={{
                position: "absolute",
                // marginLeft: -10,
                right: 5,
                top: 0,
                fontSize: 10,
                // marginTop: 0,
                fontWeight: "bold",
                backgroundColor: "#D80808",
                // borderWidth: 2,
                // borderStyle: "solid",
                // borderColor: "white",
                // paddingBottom: 18,
              }}
              size={17}
            >
              {bellbadge}
            </Badge>
          )}
        </Pressable>

        <IconButton
          icon="account-circle"
          onPress={() => navigation.navigate("MyProfile")}
          style={{
            marginRight: "5%",
          }}
        ></IconButton>
      </RowBetween>

      <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
        <SearchField
          placeholder="Search Community"
          onChangeText={handleSearch}
        />
        <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
          <TouchableOpacity>
            <Icon name="magnify" size={24} />
          </TouchableOpacity>
        </View>
      </Row>
      <Divider />
      {!searching ? (
        <>
          {searchCommunityMutation.isLoading ? (
            <>
              <ActivityIndicator
                style={{
                  display: "flex",
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </>
          ) : (
            <>
              {communitiesFound.length > 0 ? (
                <>
                  <InfiniteScroll
                    renderData={renderData}
                    data={communitiesFound}
                    loadMore={loadMore}
                  />
                  {viewCommunityMutation.isLoading && (
                    <ActivityIndicator
                      style={{
                        display: "flex",
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 40,
                        marginBottom: 30,
                      }}
                    />
                  )}
                </>
              ) : viewCommunityMutation.isLoading ? (
                <ActivityIndicator
                  style={{
                    display: "flex",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="people" size={130} color="#848484" />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      marginTop: 0,
                      marginBottom: 20,
                      color: "#848484",
                    }}
                  >
                    No Community Found
                  </Text>
                </View>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {communitiesSeached && communitiesSeached.length > 0 ? (
            communitiesSeached?.map((community, index) => (
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
            <ActivityIndicator
              style={{
                marginTop: 50,
              }}
            />
          )}
        </>
      )}
    </Container>
  );
}
