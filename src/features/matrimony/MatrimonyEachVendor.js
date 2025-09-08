import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASEAPIURL } from "../../infrastructure/constants";
import authHeader from "../../services/auth.header";
import { Calendar } from "react-native-calendars";
import { getImageUrl } from "../../services/socialMedia.services";
import {
  Image,
  Text,
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Button,
  Linking,
} from "react-native";
import { IconButton } from "react-native-paper";
import { SafeArea } from "../../components/utility/safe-area.component";
import { Container, RowBetween } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Row } from "../../styles/dashboard.styles";
import ImageViewerScreen from "../../components/matrimony/ImageViewerScreen";
import { useQuery } from "@tanstack/react-query";
import { getShceduledDates } from "../../services/matrimony.services";
import { useTranslation } from "react-i18next";

const MatrimonyEachVendor = ({ route }) => {
  const [vendorImages, setVendorImages] = useState([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().toISOString().slice(5, 7)); // 05/02/2022
  const [markedDates, setMarkedDates] = useState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();

  const {
    _id,
    emailId,
    name,
    city,
    state,
    images,
    imgUrl,
    rating,
    timing,
    services,
    address,
    about,
    contactNo,
    navigation,
  } = route.params;
  const data = {
    _id,
    emailId,
    name,
    city,
    state,
    images,
    rating,
    timing,
    services,
    address,
    about,
    contactNo,
  };

  useEffect(async () => {
    let temp = [];
    for await (let item of images) {
      const res = await getImageUrl(item);
      temp.push(res.url);
    }
    Promise.resolve(setVendorImages(temp));
  }, []);
  const HEADER_EXPANDED_HEIGHT = 400;
  const HEADER_COLLAPSED_HEIGHT = 60;
  const [showViewer, setShowViewer] = React.useState(false);
  let scrollY = new Animated.Value(0);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
    outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
    extrapolate: "clamp",
  });

  const VendorCallCount = async () => {
    const temp = await authHeader();
    const res = await axios
      .patch(
        `${BASEAPIURL}/vendor/call-count?vendor_id=${_id}`,
        {},
        {
          headers: await authHeader(),
        }
      )
      .then((res) => {})
      .catch((err) => {});
    return res;
  };

  const { Data_dates } = useQuery(
    ["vendor-one-user"],
    () => getShceduledDates(_id, month, year),
    {
      onSuccess: (data) => {
        let bufferArray = {};
        data.data.map((item) => {
          if (item.todate === undefined) {
            bufferArray[item.fromdate.slice(0, 10)] = {
              marked: true,
              dotColor: "#D8AE25",
              textColor: "#D8AE25",
            };
          } else {
            bufferArray[item.fromdate.slice(0, 10)] = {
              marked: true,
              dotColor: "#D8AE25",
              textColor: "#D8AE25",
            };
            bufferArray[item.todate.slice(0, 10)] = {
              marked: true,
              dotColor: "#D8AE25",
              textColor: "#D8AE25",
            };
            var temp = new Date(item.fromdate);
            temp.setDate(temp.getDate() + 1);
            var daysOfYear = [];
            for (
              var d = temp;
              d < new Date(item.todate);
              d.setDate(d.getDate() + 1)
            ) {
              let ss = new Date(d).toISOString().slice(0, 10);
              bufferArray[ss] = {
                marked: true,
                dotColor: "#D8AE25",
                textColor: "#D8AE25",
              };
            }
          }
        });
        setMarkedDates(bufferArray);
        setLoadingDates(false);
      },
    }
  );

  const renderBackground = () => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={() => setShowViewer(true)}>
        <Animated.View style={{ height: headerHeight }}>
          <Image
            source={{
              uri: imgUrl,
            }}
            resizeMode="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderContentBackground = (user) => {
    return (
      <View style={styles.scrollContainer}>
        <RowBetween>
          <View>
            <Text style={styles.title}>{user.name || t('vendorName') || 'Vendor Name'}</Text>
            <Text style={styles.content}>
              {user.city || t('city') || 'City'}{user.state ? `, ${user.state}` : ''}
            </Text>
          </View>
        </RowBetween>
        <View style={styles.services}>
          <Text style={{ marginTop: 16, fontSize: 14, fontWeight: "bold" }}>
            {t('serviceProvided') || 'Service Provided'}
          </Text>
          <View>
            <Text
              style={{
                marginTop: "2%",
                fontSize: 14,
                color: "#d8ae25",
                fontWeight: "bold",
                backgroundColor: "#F7EFD5",
                padding: "2%",
                borderRadius: 6,
                borderColor: "#d8ae25",
                borderWidth: 1,
              }}
            >
              {user.services || t('noServicesAvailable') || 'No services available'}
            </Text>
          </View>
        </View>

        <Text style={{ marginTop: 16, fontSize: 14, fontWeight: "bold" }}>
          {t('gallery') || 'Gallery'}
        </Text>
        <Row style={{ paddingTop: 16, paddingBottom: 16 }}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {vendorImages && vendorImages.length > 0 ? (
              vendorImages.map((image, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setCurrentIndex(i);
                    setShowViewer(true);
                  }}
                >
                  <Image
                    source={{
                      uri: image,
                    }}
                    resizeMode="cover"
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      marginRight: 10,
                    }}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noImagesContainer}>
                <Text style={styles.noImagesText}>{t('noImagesAvailable') || 'No images available'}</Text>
              </View>
            )}
          </ScrollView>
        </Row>
        <View>
          <Text style={{ marginTop: 16, fontSize: 14, fontWeight: "bold" }}>
            {t('aboutUs') || 'About Us'}
          </Text>
          <Text style={{ color: "#898E92", marginTop: "2%" }}>
            {user.about || t('noDescriptionAvailable') || 'No description available'}
          </Text>
        </View>

        <View>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <Text style={{ marginTop: 16, fontSize: 14, fontWeight: "bold" }}>
              {t('availability') || 'Availability'}
            </Text>
            {loadingDates && (
              <Image
                style={{
                  width: 15,
                  height: 15,
                  marginTop: "5%",
                  marginLeft: "2%",
                  opacity: 0.4,
                }}
                source={{
                  uri: "https://i.gifer.com/ZZ5H.gif",
                }}
              ></Image>
            )}
          </View>
          <View style={styles.calender}>
            <Calendar
              markingType={"period"}
              style={{
                marginTop: "3%",
                borderRadius: 6,
                backgroundColor: "#F7EFD5",
                height: 380,
              }}
              theme={{
                arrowColor: "#D8AE25",
                calendarBackground: "#f7f7f7",
              }}
              // Collection of dates that have to be marked. Default = {}
              markedDates={markedDates}
              onMonthChange={async (data) => {
                setLoadingDates(true);
                const res = await getShceduledDates(
                  _id,
                  data.dateString.slice(5, 7),
                  data.year
                );
                let bufferArray = {};
                res.data.map((item) => {
                  if (item.todate === undefined) {
                    bufferArray[item.fromdate.slice(0, 10)] = {
                      marked: true,
                      dotColor: "#D8AE25",
                      textColor: "#D8AE25",
                    };
                  } else {
                    bufferArray[item.fromdate.slice(0, 10)] = {
                      marked: true,
                      dotColor: "#D8AE25",
                      textColor: "#D8AE25",
                    };
                    bufferArray[item.todate.slice(0, 10)] = {
                      marked: true,
                      dotColor: "#D8AE25",
                      textColor: "#D8AE25",
                    };
                    var temp = new Date(item.fromdate);
                    temp.setDate(temp.getDate() + 1);
                    var daysOfYear = [];
                    for (
                      var d = temp;
                      d < new Date(item.todate);
                      d.setDate(d.getDate() + 1)
                    ) {
                      // let ss = new Date(d).toISOString();
                      // const yearr = ss.slice(6, 10)
                      // const dayy = ss.slice(3,5)
                      // const monthh = ss.slice(0,2)
                      let ss = new Date(d).toISOString().slice(0, 10);

                      // ss = '20'+yearr + '-' + monthh + '-' + dayy
                      bufferArray[ss] = {
                        marked: true,
                        dotColor: "#D8AE25",
                        textColor: "#D8AE25",
                      };
                    }
                  }
                });
                setLoadingDates(false);

                setMarkedDates(bufferArray);
              }}
            />
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View
            style={{
              backgroundColor: "#F7EFD5",
              padding: 8,
              borderRadius: 20,
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="map-marker" size={20} color="#D4AF37" />
          </View>
              <Text
                style={{
                  fontSize: 14,
                  color: "#656565",
                  marginLeft: 12,
                  marginRight: 16,
                  width: "90%",
                  textTransform: "capitalize",
                }}
              >
                {user.city || t('city') || 'City'}, {user.address || t('address') || 'Address'}
              </Text>
        </View>

        <View>
          <View style={styles.contentContainer}>
            <View
              style={{
                backgroundColor: "#F7EFD5",
                padding: 8,
                borderRadius: 20,
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="email" size={20} color="#D4AF37" />
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL(`mailto:${user.emailId}`)}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#656565",
                  marginLeft: 12,
                  marginRight: 16,
                  width: "90%",
                }}
              >
                {user.emailId || t('noEmail') || 'No email'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contentContainer}>
            <View
              style={{
                backgroundColor: "#F7EFD5",
                padding: 8,
                borderRadius: 20,
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="phone" size={20} color="#D4AF37" />
            </View>
            {/* <TouchableOpacity onPress={VendorCallCount}> */}
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(`tel:${user.contactNo}`);
                VendorCallCount();
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#656565",
                  marginLeft: 12,
                  marginRight: 16,
                  width: "90%",
                }}
              >
                {user.contactNo || t('noContactNumber') || 'No contact number'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeArea>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          backgroundColor: "white",
        }}
      >
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={() => navigation.goBack()}
        />
        <Text
          style={{
            color: "#242424",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          {t('matrimony') || 'Matrimony'}
        </Text>
      </View>
      {vendorImages && vendorImages.length > 0 ? (
        <Modal visible={showViewer} transparent={true}>
          <ImageViewerScreen
            images={vendorImages}
            setShowViewer={setShowViewer}
            index={currentIndex}
          />
        </Modal>
      ) : null}

      <ScrollView
        renderBackground={renderBackground}
        renderContentBackground={() => renderContentBackground(data)}
        parallaxHeaderHeight={400}
        renderForeground={() => (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowViewer(true)}
            style={{ height: "100%" }}
          ></TouchableOpacity>
        )}
      ></ScrollView>
    </SafeArea>
  );
};

export default MatrimonyEachVendor;

const styles = StyleSheet.create({
  txtData: {
    color: "#656565",
    fontSize: 18,
    width: "30%",
  },
  txtDataValue: {
    color: "#656565",
    fontSize: 18,
  },
  oneDetail: {
    marginBottom: 12,
    display: "flex",
    flexDirection: "row",
  },
  familyDetails: {
    paddingTop: "6%",
  },
  fatherFamilyData: {
    marginTop: "4%",
    paddingTop: "1%",
  },
  fatherDetails: {
    paddingTop: "1%",
  },
  famD: {
    color: "#D4AF37",
    fontSize: 25,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
    textTransform: "capitalize",
  },
  content: { color: "#898E92", textTransform: "capitalize" },
  contentContainer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  noImagesContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImagesText: {
    fontSize: 14,
    color: '#666',
    opacity: 0.6,
    textAlign: 'center',
  },
});
