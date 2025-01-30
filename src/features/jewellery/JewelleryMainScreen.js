import {
  StyleSheet,
  Text,
  Dimensions,
  ActivityIndicator,
  Image,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Divider, IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import Icon from "react-native-vector-icons/Ionicons";
import { Row } from "../../styles/dashboard.styles";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { debounce } from "lodash";

import React, { useCallback } from "react";
import {
  Container,
  RowBetween,
  SearchField,
  View,
} from "../../styles/common.styles";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import { getShopData } from "../../services/jewellery.services";
import { getWorkersSearchData } from "../../services/jewellery.services";
import { getShopRetailerSearchData } from "../../services/jewellery.services";
import { getImageUrl } from "../../services/socialMedia.services";
// import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';

const JewelleryMainScreen = () => {
  const navigation = useNavigation();
  const [index, setIndex] = React.useState(0);
  const [shopData, setShopData] = React.useState([]);
  const [workersData, setWorkersData] = React.useState([]);
  const [retailersData, setRetailersData] = React.useState([]);
  const [isloading, setIsloading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  // React.useEffect(() => {
  //     setIsloading(false);
  //   }, [data]);
  React.useEffect(async () => {
    if (index === 2) {
      const searchWorkersFunction = async () => {
        const res = await getWorkersSearchData(search);
        if (res.status === 0) {
          for await (let item of res.data) {
            if (item.images.length > 0) {
              const resp = await getImageUrl(item.images[0]);
              item.imgUrl = resp.url;
            }
          }
          setWorkersData(res.data);
        } else {
          setWorkersData([]);
        }
      };
      await searchWorkersFunction();
    } else if (index === 1) {
      const searchRetailersFunction = async () => {
        const res = await getShopRetailerSearchData({ search, index });
        if (res.status === 0) {
          for await (let item of res.data) {
            if (item.images.length > 0) {
              const resp = await getImageUrl(item.images[0]);
              item.imgUrl = resp.url;
            }
          }
          setRetailersData(res.data);
        } else {
          setRetailersData([]);
        }
      };
      await searchRetailersFunction();
    } else if (index === 0) {
      const searchShopFunction = async () => {
        const res = await getShopRetailerSearchData({ search, index });

        if (res.status === 0) {
          for await (let item of res.data) {
            if (item.images.length > 0) {
              const resp = await getImageUrl(item.images[0]);
              item.imgUrl = resp.url;
            }
          }
          setShopData(res.data);
        } else {
          setShopData([]);
        }
      };
      await searchShopFunction();
    }
  }, [search, index]);

  React.useEffect(async () => {
    setIsloading(true);

    const getShopDataFunction = async () => {
      const res = await getShopData();
      if (res.status === 0) {
        for await (let item of res.data) {
          if (item.images.length > 0) {
            const resp = await getImageUrl(item.images[0]);
            item.imgUrl = resp.url;
          }
        }
        setShopData(res.data);
      } else {
      }
    };
    // const getWorkersDataFunction = async() =>{
    //   const res = await getWorkersData()
    //   if(res.status===0){

    //       for await (let item of res.data) {
    //           if(item.images.length>0){
    //               const resp = await getImageUrl(item.images[0]);
    //               item.imgUrl = resp.url;
    //           }

    //         }
    //       setWorkersData(res.data)

    //   }else{

    //   }
    // }
    // const getRetailersDataFunction = async() =>{
    //   const res = await getRetailersData()
    //   if(res.status===0){

    //       for await (let item of res.data) {
    //           if(item.images.length>0){
    //               const resp = await getImageUrl(item.images[0]);
    //               item.imgUrl = resp.url;
    //           }

    //         }
    //         setRetailersData(res.data)

    //   }else{

    //   }
    // }
    await getShopDataFunction();
    // await getWorkersDataFunction()
    // await getRetailersDataFunction()
    setIsloading(false);
  }, []);
  const initialLayout = { width: Dimensions.get("window").width };
  // const searchWorkerMutation = useMutation(getSearchUsersMatrimony, {
  //   onSuccess: (data) => {

  //     setWorkersData(data);
  //   },
  //   onError: (err) => {
  //     dispatch(ErrorToggle({
  //       toggle : true,
  //       msg: err.message,
  //       type: 'error',
  //       }));
  //   },
  // });

  const SearchWorker = async ({ searchTerm }) => {
    setSearch(searchTerm);
  };

  const searchDebounce = useCallback(debounce(SearchWorker, 1200), []);

  const handleSearch = (e) => {
    searchDebounce({ searchTerm: e });
  };

  const [routes] = React.useState([
    { key: "first", title: "Shop" },
    { key: "second", title: "Retailers" },
    { key: "third", title: "Workers" },
  ]);

  const FirstRoute = () => (
    <ScrollView style={{ marginTop: "1%" }}>
      {/* {shopData && shopData.length > 0 ? (
        shopData.map((shop, index) => ( */}
          <Pressable
            key={index}
            onPress={() =>
              navigation.navigate("EachShop", {
                id: shop._id,
                name: shop.name,
                address: shop.address,
                city: shop.city,
                images: shop.images,
                imgUrl: shop.imgUrl,
              })
            }
          >
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
              {/* {shop.imgUrl ? (
                <Image
                  style={{ width: 90, height: 90, borderRadius: 8 }}
                  source={{
                    uri: shop?.imgUrl,
                  }}
                ></Image>
              ) : ( */}
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
              {/* )} */}

              <View style={{ flexDirection: "column", marginLeft: "4%" }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    opacity: 0.7,
                    marginLeft: "2%",
                    marginTop: "2%",
                    fontSize: 15,
                  }}
                >
                  {/* {shop?.name} */}
                  Shop Name
                </Text>
                <View style={{ flexDirection: "column", marginTop: "8%" }}>
                  <View style={{ marginTop: "2%" }}>
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
                      City
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontWeight: "500",
                      opacity: 0.4,
                      marginLeft: "3%",
                    }}
                  >
                    {/* {shop?.address[0]} */}
                    Address
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        {/* ))
      ) : ( */}
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
                uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKX5I7wg81pT0gqzFGwMgnF962dGcou-I5UzFHJrNmwLY4_Me25rJTnrkX9RkqEckpcK4&usqp=CAU",
              }}
            />
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              No Shop found
            </Text>
          </View>
        </View>
      {/* )} */}
    </ScrollView>
  );

  const SecondRoute = () => (
    <ScrollView style={{ marginTop: "1%" }}>
      {/* {retailersData && retailersData.length > 0 ? (
        retailersData.map((retailer, index) => ( */}
          <Pressable
            key={index}
            onPress={() =>
              navigation.navigate("EachShop", {
                id: retailer._id,
                name: retailer.name,
                address: retailer.address,
                city: retailer.city,
                images: retailer.images,
                imgUrl: retailer.imgUrl,
              })
            }
          >
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
              {/* {retailer.imgUrl ? (
                <Image
                  style={{ width: 90, height: 90, borderRadius: 8 }}
                  source={{
                    uri: retailer?.imgUrl,
                  }}
                ></Image>
              ) : ( */}
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
              {/* )} */}

              <View style={{ flexDirection: "column", marginLeft: "4%" }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    opacity: 0.7,
                    marginLeft: "2%",
                    marginTop: "2%",
                    fontSize: 15,
                  }}
                >
                  {/* {retailer?.name} */}
                  Retailer Name
                </Text>
                <View style={{ flexDirection: "column", marginTop: "8%" }}>
                  <View style={{ marginTop: "2%" }}>
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
                      {/* {retailer?.city} */}
                      City
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontWeight: "500",
                      opacity: 0.4,
                      marginLeft: "3%",
                    }}
                  >
                    {/* {retailer?.address[0]} */}
                    Address
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        {/* ))
      ) : ( */}
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
                uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKX5I7wg81pT0gqzFGwMgnF962dGcou-I5UzFHJrNmwLY4_Me25rJTnrkX9RkqEckpcK4&usqp=CAU",
              }}
            />
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              No Retailers found
            </Text>
          </View>
        </View>
      {/* )} */}
    </ScrollView>
  );

  const ThirdRoute = () => (
    <ScrollView style={{ marginTop: "1%" }}>
      {/* {workersData && workersData.length > 0 ? (
        workersData.map((worker, index) => ( */}
          <Pressable
            key={index}
            onPress={() =>
              navigation.navigate("EachWorker", {
                name: worker?.name,
                phone: worker?.phone,
                email: worker?.email,
                address: worker?.address[0],
                city: worker?.city,
                state: worker?.state,
                images: worker?.images,
              })
            }
          >
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
              {/* {worker.imgUrl ? (
                <Image
                  style={{ width: 90, height: 90, borderRadius: 8 }}
                  source={{
                    uri: worker?.imgUrl,
                  }}
                ></Image>
              ) : ( */}
                <Image
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 8,
                    opacity: 0.6,
                  }}
                  source={{
                    uri: "https://img.icons8.com/external-vitaliy-gorbachev-lineal-color-vitaly-gorbachev/344/external-worker-labour-day-vitaliy-gorbachev-lineal-color-vitaly-gorbachev-1.png",
                  }}
                ></Image>
              {/* )} */}

              <View style={{ flexDirection: "column", marginLeft: "4%" }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    opacity: 0.7,
                    marginLeft: "2%",
                    marginTop: "2%",
                    fontSize: 15,
                  }}
                >
                  {/* {worker?.name} */}
                  Worker Name
                </Text>
                <View style={{ flexDirection: "column", marginTop: "8%" }}>
                  <View style={{ marginTop: "2%" }}>
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
                      {/* {worker?.city} */}
                      City
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontWeight: "500",
                      opacity: 0.4,
                      marginLeft: "3%",
                    }}
                  >
                    {/* {worker?.address[0]} */}
                    Address
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        {/* ))
      ) : ( */}
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
              style={{ width: 120, height: 120, marginBottom: "2%" }}
              source={{
                uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTGyDvGz4KeBYxqA5KtqiIg6bx1y4m9XObHwQPMxxS917Y3fbGJSw8-BvPVuz0qx0rXhM&usqp=CAU",
              }}
            />
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              No Workers found
            </Text>
          </View>
        </View>
      {/* )} */}
    </ScrollView>
  );
 
    // return (
    //   <Container
    //     style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    //   >
    //     <RowBetween style={{ paddingTop: 24 }}>
    //       <View style={{ alignItems: "center" }}>
    //         <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
    //         <TopText
    //           style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
    //         >
    //           Jewellery
    //         </TopText>
    //       </View>
    //       <IconButton
    //         icon="bell-outline"
    //         style={{ marginLeft: "auto" }}
    //       ></IconButton>
    //     </RowBetween>
    //     <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
    //       <SearchField placeholder="Search" onChangeText={handleSearch} />
    //       <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
    //         <Icon name="search" size={24} />
    //       </View>
    //     </Row>
    //     <TabView
    //       navigationState={{ index, routes }}
    //       renderScene={renderScene}
    //       onIndexChange={setIndex}
    //       initialLayout={initialLayout}
    //       style={styles.container}
    //       renderTabBar={(props) => (
    //         <TabBar
    //           {...props}
    //           renderLabel={({ route }) => (
    //             <Text
    //               style={{
    //                 color: "#B88B13",
    //                 fontWeight: "600",
    //                 margin: 8,
    //                 fontSize: 16,
    //               }}
    //             >
    //               {route.title}
    //             </Text>
    //           )}
    //           indicatorStyle={{ backgroundColor: "#D4AF37" }}
    //           style={{ backgroundColor: "white" }}
    //         />
    //       )}
    //     />
    //   </Container>
    // );
  }
// };

export default JewelleryMainScreen;

export const styles = StyleSheet.create({
  oldPrice: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    opacity: 0.4,
    fontSize: 12,
  },
  eachJewelleryCard: {
    width:"45%",
    padding: "4%",
    marginBottom: "5%",
  },
  eachJewelleryCardImg: {
    width: "100%",
    height: 110,
    borderRadius: 4,
  },
  eachJewelleryCardFooter: {
    backgroundColor: "#D4AF37",
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    padding: "3%",
  },
  eachJewelleryCardContainer: {
    marginTop: "4%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
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
});
