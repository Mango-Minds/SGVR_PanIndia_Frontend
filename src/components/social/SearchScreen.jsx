import React, { useCallback, useRef, useEffect, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  RefreshControl,
} from "react-native";
import { Divider, IconButton } from "react-native-paper";
import {
  Container,
  RowBetween,
  SearchField,
  View,
} from "../../styles/common.styles";
import { Row } from "../../styles/dashboard.styles";
import { TopText } from "../../styles/social.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useMutation, useQueryClient } from "react-query";
import {
  getImageUrl,
  getSearchUsers,
} from "../../services/socialMedia.services";
import { debounce } from "lodash";
import { useDispatch } from "react-redux";
import { ErrorToggle } from "../../store/user";
import { useSelector } from "react-redux";
import { UpdateSocialData } from "../../store/Handlers/Reducer.Handler";
import SearchScreenUserThumb from "./SearchScreenUserThumb";

export default function SearchScreen({ navigation }) {
  const { socialData } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const queryclient = useQueryClient();

  // const [usersFound, setUsersFound] = useState(socialData.searchList);

  const [search, setSearch] = useState("");
  const [refreshing, setrefreshing] = useState(false);

  const searchUserMutation = useMutation(getSearchUsers, {
    onSuccess: async (data) => {
      if (data.status === 0) {
        if (data.profiles.length > 0) {
          for await (const item of data.profiles) {
            if (item && item.dp) {
              const get = await getImageUrl(item.dp);
              if (get.status === 0) {
                item.dp = get.url;
              }
            }
          }
        }
        await dispatch(
          UpdateSocialData({ ...socialData, searchList: data.profiles })
        );
      } else
        await dispatch(UpdateSocialData({ ...socialData, searchList: [] }));
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

  // useEffect(() => {
  //   setUsersFound(socialData.searchList);
  // }, [socialData.searchList]);

  const SearchUsers = async ({ searchTerm }) => {
    await searchUserMutation.mutateAsync({ searchTerm });
  };

  const searchDebounce = useCallback(debounce(SearchUsers, 500), []);

  const handleSearch = (e) => {
    setSearch(e);
    if (e.length >= 3) {
      searchDebounce({ searchTerm: e });
    } else {
      searchDebounce({ searchTerm: "" });
    }
  };

  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center" }}>
          <IconButton
            icon="arrow-left"
            onPress={() => {
              navigation.goBack();
            }}
          />
          <TopText
            style={{ color: "#000000", fontSize: 22, fontWeight: "bold" }}
          >
            Search
          </TopText>
        </View>
      </RowBetween>
      <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
        <SearchField placeholder="Search" onChangeText={handleSearch} />
        <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
          <TouchableOpacity>
            <Icon name="magnify" size={24} />
          </TouchableOpacity>
        </View>
      </Row>
      {socialData.searchList.length > 0 ? (
        <ScrollView
          style={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              onRefresh={async () => {
                setrefreshing(true);
                await queryclient.invalidateQueries("get-friend-list");
                setrefreshing(false);
              }}
              refreshing={refreshing}
            />
          }
        >
          {/* {socialData.searchList.map((user) => (
            <LikeCard
              key={user.id}
              user={user}
              navigation={navigation}
            />
          ))} */}
          <Divider />
          {searchUserMutation?.isLoading ? (
            <ActivityIndicator />
          ) : (
            <>
              {socialData.searchList &&
                socialData.searchList.length > 0 &&
                socialData.searchList?.map((item, index) => {
                  if (item.isFollowing === false && item.isrequested === false)
                    return (
                      <SearchScreenUserThumb
                        item={item}
                        key={index}
                        search={search}
                        handleSearch={handleSearch}
                      />
                    );
                })}
              {socialData.searchList &&
                socialData.searchList.length > 0 &&
                socialData.searchList?.map((item, index) => {
                  if (item.isFollowing === false && item.isrequested === true)
                    return (
                      <SearchScreenUserThumb
                        cameFrom={"searchScreen"}
                        item={item}
                        key={index}
                        search={search}
                        handleSearch={handleSearch}
                      />
                    );
                })}
              {socialData.searchList &&
                socialData.searchList.length > 0 &&
                socialData.searchList?.map((item, index) => {
                  if (item.isFollowing === true)
                    return (
                      <SearchScreenUserThumb
                        cameFrom={"searchScreen"}
                        item={item}
                        key={index}
                        search={search}
                        handleSearch={handleSearch}
                      />
                    );
                })}
            </>
          )}
        </ScrollView>
      ) : (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 10,
              flexDirection: "column",
            }}
          >
            <Icon name="account-search" size={150} color="#00000029" />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#00000029",
                marginTop: 10,
              }}
            >
              Search For People...
            </Text>
          </View>
        </TouchableWithoutFeedback>
      )}
    </Container>
  );
}
