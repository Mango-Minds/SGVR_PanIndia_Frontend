import React, { useCallback, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from "react-native";
import { Divider, IconButton } from "react-native-paper";
import {
  Container,
  InputField,
  RowBetween,
  SearchField,
  View,
} from "../../styles/common.styles";
import { Row } from "../../styles/dashboard.styles";
import { TopText } from "../../styles/social.styles";
import SearchResult from "../../components/matrimony/SeachResultCard";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useMutation } from "react-query";
import { getSearchUsersMatrimony } from "../../services/socialMedia.services";
import { debounce } from "lodash";
import { useDispatch } from "react-redux";
import { ErrorToggle } from "../../store/user";
import SearchResultVcard from "../../components/matrimony/SearchResultCardVendor";

export default function MatrimonySearchScreen({ navigation, route }) {
  const { matrimonySection } = route.params;
  const dispatch = useDispatch();
  const [usersFound, setUsersFound] = useState([]);
  const [ageRange, setAgeRange] = useState([18, 40]);

  const searchUserMutation = useMutation(getSearchUsersMatrimony, {
    onSuccess: (data) => {
      setUsersFound(data);
    },
    onError: (err) => {
      dispatch(
        ErrorToggle({
          toggle: true,
          msg: err.message,
          type: "error",
        })
      );
    },
  });

  const SearchUsers = async ({ searchTerm }) => {
    await searchUserMutation.mutateAsync({ searchTerm, matrimonySection });
  };

  const searchDebounce = useCallback(debounce(SearchUsers, 500), []);

  const handleSearch = (e) => {
    searchDebounce({ searchTerm: e });
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
      {/* <Slider
        value={ageRange}
        onValueChange={(value) => setAgeRange(value)}
        animateTransitions
        maximumTrackTintColor="#d3d3d3"
        maximumValue={36}
        minimumTrackTintColor="#D4AF37"
        minimumValue={18}
        step={2}
        thumbTintColor="#D4AF37"
      /> */}
      <ScrollView
        style={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Divider />
        {/* {searchUserMutation?.isLoading ? (
          <ActivityIndicator />
        ) : (
          <> */}
        {matrimonySection === "vendor"
          ? usersFound?.map((item, index) => (
              <SearchResultVcard {...item} key={index} />
            ))
          : usersFound?.map((item, index) => (
              <SearchResult {...item} key={index} />
            ))}

        {/* </>
        )} */}
      </ScrollView>
    </Container>
  );
}
