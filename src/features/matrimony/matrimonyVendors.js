import React, { useState } from "react";
import { Dimensions, Linking, Pressable } from "react-native";
import SalonCard from "../../components/dashboard/SalonCard";
import PopularHalls from "../../components/dashboard/PopularHalls";
import CustomCarousel from "../../components/dashboard/CustomCarousel";
import { useDispatch } from "react-redux";
import { ErrorToggle } from "../../store/user";
const windowWidth = Dimensions.get("window").width;

import {
  BannerContainer,
  HeaderText,
  TopHeader,
  DashboardSection,
  SectionTitle,
  MainContainerDashboard,
  BannerButton,
  ExploreContainer,
  ExploreIcon,
  ExploreIconContainer,
  ExploreIconName,
  Row,
} from "../../styles/dashboard.styles";
import axios from "axios";
import { BASEAPIURL } from "../../infrastructure/constants";
import authHeader from "../../services/auth.header";

export default function MatrimonyVendorsScreen({ navigation }) {
  const dispatch = useDispatch();
  const [subscribe, setSubscribe] = React.useState(true);
  const [adsData, setAdsData] = useState([]);
  const [adsImages, setAdsImages] = useState([]);
  const [vendors, setVendors] = useState([]);

  // const renderItem = ({ item, index }) => {
  //   try {
  //     return (
  //       <Pressable
  //         onPress={() => {
  //           item.link && item.link !== "" ? Linking.openURL(item.link) : null;
  //         }}
  //       >
  //         <BannerContainer
  //           key={index}
  //           source={{ uri: adsImages[index] }}
  //           resizeMode="cover"
  //         />
  //       </Pressable>
  //     );
  //   } catch (error) {
  //     dispatch(
  //       ErrorToggle({
  //         msg: error.message,
  //         toggle: true,
  //         type: "error",
  //       })
  //     );
  //   }
  // };
  const renderVendorItem = async () => {
    await axios
      .get(
        BASEAPIURL + "/vendor/vendor-for-user?page=1&limit=10&module=matrimony",
        {
          headers: await authHeader(),
        }
      )
      .then(async (res) => {
        if (res.data.status === 0) {
          setVendors(res.data.data);
        } else if (res.data.status === 1) {
        }
      })
      .catch((err) => {
        dispatch(
          ErrorToggle({
            msg: err.message,
            toggle: true,
            type: "error",
          })
        );
      });
  };

  React.useEffect(() => {
    if (subscribe) {
      const getDashboardData = async () => {
        axios
          .get(BASEAPIURL + "/ad/ads-for-user", { headers: await authHeader() })
          .then(async (res) => {
            if (res.data.status === 0) {
              const foundAds = [...res.data.ads];

              setAdsData(foundAds);
              setAdsImages(res.data.imageUrl);

              // await Promise.resolve();
            } else if (res.data.status === 1) {
            }
          })
          .catch((err) => {
            dispatch(
              ErrorToggle({
                msg: err.message,
                toggle: true,
                type: "error",
              })
            );
          });
      };
      getDashboardData();
      renderVendorItem();
    }

    return () => {
      setSubscribe(false);
    };
  }, []);

  // const getAdds = async () => {
  //   axios
  //     .get(BASEAPIURL + "/ad/ads-for-user", { headers: await authHeader() })
  //     .then(async (res) => {
  //       if (res.data.status === 0) {
  //         const foundAds = [...res.data.ads];
  //         setAdsData(foundAds);
  //         setAdsImages(res.data.imageUrl);

  //         // await Promise.resolve();
  //       } else if (res.data.status === 1) {
  //       }
  //     })
  //     .catch((err) => {
  //       // console.log(err);
  //     });
  // };

  // getAdds();

  return (
    <MainContainerDashboard style={{ marginTop: 0, paddingTop: 0  , height : "100%"}}>
     

      <DashboardSection>
        <SectionTitle style={{ marginBottom: 16 }}>
          Recently Onboarded Vendors
        </SectionTitle>
        <PopularHalls data={vendors} navigation={navigation} />
      </DashboardSection>

      {/* <DashboardSection>
        <SectionTitle style={{ marginBottom: 16 }}>
          Popular Vendors
        </SectionTitle>
        {jobData.map((job, idx) => (
          <SalonCard {...job} key={idx} />
        ))}
      </DashboardSection> */}
    </MainContainerDashboard>
  );
}
