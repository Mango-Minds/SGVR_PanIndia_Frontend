import React from "react";
import { ScrollView, TouchableOpacity, Text, View as RNView, Modal as RNModal } from "react-native";
import { Divider, IconButton, Button, TextInput as PaperInput } from "react-native-paper";
import {
  Container,
  RowBetween,
  SearchField,
  View,
} from "../../styles/common.styles";
import { Row } from "../../styles/dashboard.styles";
import { TopText } from "../../styles/social.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import NewMessageCard from "./NewMessageCard";
import { useSelector } from "react-redux";
import { GetAllFriends } from "../../services/socialMedia.services";
import { useTranslation } from "react-i18next";

export default function NewMessageScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, socialData } = useSelector((state) => state.user);
  const [friends, setFriends] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState([]); // array of userIds
  const [selectMode, setSelectMode] = React.useState(true); // enable multi-select compose
  const [creating, setCreating] = React.useState(false);
  const [groupName, setGroupName] = React.useState("");
  const [showNameModal, setShowNameModal] = React.useState(false);

  const handleCreateGroup = async () => {
    try {
      setCreating(true);
      const userIds = [user?._id, ...selected];
      const uniqueSorted = Array.from(new Set(userIds)).sort();
      const name = groupName.trim();
      const { roomId } = await (await import('../../services/chat.services')).createOrGetRoom(uniqueSorted, name);
      if (roomId) {
        setShowNameModal(false);
        setGroupName("");
        navigation.navigate('ChatScreen', {
          toid: roomId,
          toName: name,
          isGroup: true,
          roomId,
        });
      }
    } finally {
      setCreating(false);
    }
  };

  React.useEffect(() => {
    const loadFriends = async () => {
      try {
        const res = await GetAllFriends({ userid: user?._id });
        const list = Array.isArray(res?.friends)
          ? res.friends.map((u) => ({
              _id: u._id,
              fname: u.firstName || "",
              lname: u.lastName || "",
              username: u.email || (u.firstName || "").toLowerCase(),
              dp: u.image || null,
            }))
          : [];
        setFriends(list);
      } catch (e) {
        setFriends([]);
      }
    };
    loadFriends();
  }, [user?._id]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const removeSelected = (id) => {
    setSelected((prev) => prev.filter((x) => x !== id));
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
            {t("new_message")}
          </TopText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
          <Text style={{ marginRight: 8, color: '#666' }}>{t("n_selected", { count: selected.length })}</Text>
          <Button
            mode="contained"
            loading={creating}
            disabled={creating || selected.length < 2}
            onPress={async () => {
              setShowNameModal(true);
            }}
            style={{ borderRadius: 22 }}
            buttonColor="#D4AF37"
            textColor="#000"
          >
            {t("create_group")}
          </Button>
        </View>
      </RowBetween>
      <RNModal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <RNView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <RNView style={{ width: '100%', backgroundColor: 'white', padding: 16, borderRadius: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>{t("create_group_title")}</Text>
            <PaperInput
              mode="outlined"
              placeholder={t("enter_group_name")}
              value={groupName}
              onChangeText={setGroupName}
              style={{ marginBottom: 12 }}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => {
                if (groupName.trim()) handleCreateGroup();
              }}
            />
            <RowBetween>
              <Button onPress={() => setShowNameModal(false)}>{t("cancel")}</Button>
              <Button
                mode="contained"
                disabled={!groupName.trim() || creating}
                loading={creating}
                onPress={handleCreateGroup}
                buttonColor="#D4AF37"
                textColor="#000"
              >
                {t("create")}
              </Button>
            </RowBetween>
          </RNView>
        </RNView>
      </RNModal>
      <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
        <SearchField placeholder={t("search")} value={search} onChangeText={setSearch} />
      </Row>
      {selected.length > 0 && (
        <RNView
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 0,
          }}
        >
          {selected.map((id) => {
            const f = friends.find((x) => x._id === id);
            const label = f ? `${f.fname} ${f.lname}`.trim() : id;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => removeSelected(id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                  backgroundColor: '#EFEFEF',
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#222' }}>{label}</Text>
                <Text style={{ marginLeft: 8, color: '#999' }}>×</Text>
              </TouchableOpacity>
            );
          })}
        </RNView>
      )}
      <ScrollView
        style={{ paddingTop: 0, paddingBottom: 12 }}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Divider style={{ marginTop: 0 }} />
        {friends.filter((f) => {
            const q = search.trim().toLowerCase();
            if (!q) return true;
            return (
              (f.fname || "").toLowerCase().includes(q) ||
              (f.lname || "").toLowerCase().includes(q) ||
              (f.username || "").toLowerCase().includes(q)
            );
          }).length > 0 ? (
          friends
            .filter((f) => {
              const q = search.trim().toLowerCase();
              if (!q) return true;
              return (
                (f.fname || "").toLowerCase().includes(q) ||
                (f.lname || "").toLowerCase().includes(q) ||
                (f.username || "").toLowerCase().includes(q)
              );
            })
            .map((item, index) => (
            <NewMessageCard
              {...item}
              key={index}
              navigation={navigation}
              selectable={selectMode}
              selected={selected.includes(item._id)}
              onToggle={toggleSelect}
            />
          ))
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 250,
            }}
          >
            <Icon name="account-search" size={30} color="#0000001A" />
            <Text
              style={{
                fontSize: 25,
                fontWeight: "800",
                color: "#0000001A",
              }}
            >
              Search Friends
            </Text>
          </View>
        )}
      </ScrollView>
    </Container>
  );
}
