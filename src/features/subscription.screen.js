// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import authHeader from "../services/auth.header";
// import { BASEAPIURL } from "../infrastructure/constants";
// import { ScrollView, View, Text, TouchableOpacity } from "react-native";
// import { IconButton } from "react-native-paper";
// import { RowBetween } from "../styles/common.styles";
// import { TopText } from "../styles/social.styles";
// import RNPgReactNativeSDK from "react-native-pg-react-native-sdk";
// import { useSelector, useDispatch } from "react-redux";
// import { ErrorToggle } from "../store/user";

// const Subscription = ({ navigation }) => {
//   const dispatch = useDispatch();
//   const [plans, setPlans] = useState([]);
//   const [mySubscription, setmySubscription] = useState("");
//   const { user } = useSelector((state) => state.user);
//   const OnPayHandler = () => {
//     const data = {
//       orderAmount: "1000",
//       orderCurrency: "INR",
//       orderId: "order_id_123",
//       customerName:
//         user.fname +
//         (user.midname != "" ? +" " + user.midname : "") +
//         " " +
//         user.lname,
//       customerEmail: user.email,
//       customerPhone: user.phone,
//       notifyUrl: "https://www.example.com/notify",
//       appId: "12815194f31080fcacd6bb0a10151821",
//       tokenData:
//         "jJ9JCN4MzUIJiOicGbhJCLiQ1VKJiOiAXe0Jye.eY0nIzkTNyQGO4MmNhZjM2IiOiQHbhN3XiwCO2czMzczM1YTM6ICc4VmIsICMwATMiojI05Wdv1WQyVGZy9mIsIiUOlkI6ISej5WZyJXdDJXZkJ3biwiIzITMfRWafJXZkJ3biojIklkclRmcvJye.kvgGKpibQcgLcyYkIutOmQUHRA8y-BJtuLoGamCBoWPokSW07Piro4NoBU44Jd1S1P",
//     };
//     RNPgReactNativeSDK.startPaymentWEB(data, "TEST", (result) => {});
//   };

//   useEffect(() => {
//     const getSubscriptionPlans = async () => {
//       await axios
//         .get(`${BASEAPIURL}/admin/subscription?page=1&limit=1`, {
//           headers: await authHeader(),
//         })
//         .then((res) => {
//           setPlans(res.data.data);
//         })
//         .catch((err) => {
//           dispatch(
//             ErrorToggle({
//               type: "error",
//               msg: "Something Went Wrong..",
//               toggle: true,
//             })
//           );
//         });
//     };

//     getSubscriptionPlans();
//   }, []);

//   const getMySubscription = async () => {
//     await axios
//       .get(`${BASEAPIURL}/subs/subs`, {
//         headers: await authHeader(),
//       })
//       .then((res) => {
//         setmySubscription(res.data.plan.subsId);
//       })
//       .catch((err) => {});
//   };

//   useEffect(() => {
//     getMySubscription();
//     // .then((res) => {
//     //   // setmySubscription(res.data.plan.subsId)
//     //   // setmySubscription(res.data.data)
//     // }).catch((err) => {
//     // });
//   }, []);

//   return (
//     <View style={{ flex: 1, paddingTop: 20 }}>
//       <RowBetween
//         style={{
//           paddingTop: 24,
//           paddingRight: 16,
//           display: "flex",

//           justifyContent: "flex-start",
//         }}
//       >
//         <IconButton
//           icon="arrow-left"
//           size={24}
//           onPress={() => navigation.goBack()}
//         />
//         <View style={{ alignItems: "center" }}>
//           <TopText style={{ color: "#000000", fontWeight: "bold" }}>
//             Subscription
//           </TopText>
//         </View>
//       </RowBetween>
//       {/* <View>
//         <TouchableOpacity onPress={OnPayHandler}>
//           <Text>Pay Now</Text>
//         </TouchableOpacity>
//       </View> */}
//       {mySubscription.price != 0 ? (
//         <View
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             marginTop: 35,
//             marginLeft: 20,
//             marginRight: 20,
//             borderWidth: 2,
//             borderColor: "#D4AF37",
//             borderRadius: 8,
//             justifyContent: "space-between",
//           }}
//         >
//           <View
//             style={{
//               padding: 15,
//             }}
//           >
//             <Text
//               style={{
//                 color: "#D4AF37",
//                 fontSize: 20,
//                 letterSpacing: 0.14,
//                 lineHeight: 24,
//                 fontWeight: "600",
//                 marginBottom: 6,
//                 textTransform: "capitalize",
//               }}
//             >
//               {mySubscription?.planName}
//             </Text>
//             <Text
//               style={{
//                 color: "#000000",
//                 fontSize: 16,
//                 letterSpacing: 0.14,
//                 lineHeight: 24,
//                 fontWeight: "500",
//               }}
//             >
//               ₹ {mySubscription?.price}
//             </Text>
//           </View>

//           {mySubscription.price !== 0 ? (
//             <TouchableOpacity>
//               <View
//                 style={{
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 <Text
//                   style={{
//                     display: "flex",
//                     backgroundColor: "#D4AF37",
//                     padding: 15,
//                     alignItems: "center",
//                     justifyContent: "center",
//                     color: "white",
//                     fontSize: 20,
//                     fontWeight: "500",
//                     paddingTop: 30,
//                     paddingBottom: 30,
//                   }}
//                 >
//                   Repeat Plan
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           ) : null}
//         </View>
//       ) : (
//         <View>
//           <View
//             style={{
//               display: "flex",
//               flexDirection: "row",
//               marginTop: 15,
//               marginLeft: 20,
//               marginRight: 20,
//               borderWidth: 2,
//               borderColor: "#D4AF37",
//               borderRadius: 8,
//               paddingHorizontal: 20,
//               paddingVertical: 20,
//               justifyContent: "space-between",
//               backgroundColor: "#D4AF371A",
//             }}
//           >
//             <Text
//               style={{
//                 color: "#D4AF37",
//                 fontSize: 20,
//                 letterSpacing: 0.5,
//                 lineHeight: 24,
//                 fontWeight: "600",
//                 marginBottom: 6,
//                 textTransform: "capitalize",
//               }}
//             >
//               Active Plan
//             </Text>
//             <Text
//               style={{
//                 color: "#D4AF37",
//                 fontSize: 18,
//                 letterSpacing: 0.3,
//                 lineHeight: 24,
//                 fontWeight: "500",
//                 textTransform: "capitalize",
//               }}
//             >
//               {mySubscription.planName}
//             </Text>
//           </View>
//         </View>
//       )}

//       <View
//         style={{
//           marginTop: 30,
//           marginLeft: 20,
//           marginRight: 20,
//         }}
//       >
//         <Text
//           style={{
//             color: "#1B1A18",
//             fontSize: 16,
//             fontWeight: "500",
//             marginBottom: 10,
//           }}
//         >
//           Subscription Plans
//         </Text>
//         <ScrollView
//           style={{
//             paddingTop: 10,
//           }}
//           showsVerticalScrollIndicator={false}
//         >
//           {plans && plans.length > 0 ? (
//             plans.map((item, index) => (
//               <TouchableOpacity key={index}>
//                 <View
//                   style={{
//                     display: "flex",
//                     flexDirection: "row",
//                     backgroundColor: "#D4AF37",
//                     padding: 20,
//                     justifyContent: "space-between",
//                     borderRadius: 8,
//                     marginBottom: 20,
//                   }}
//                 >
//                   <View
//                     style={{
//                       display: "flex",
//                       justifyContent: "center",
//                       alignItems: "center",
//                     }}
//                   >
//                     <Text
//                       style={{
//                         color: "white",
//                         fontSize: 22,
//                         fontWeight: "500",
//                         textTransform: "capitalize",
//                         letterSpacing: 0.3,
//                       }}
//                     >
//                       {item.planName}
//                     </Text>
//                   </View>
//                   <View>
//                     <Text
//                       style={{
//                         color: "white",
//                         fontSize: 23,
//                         textAlign: "center",
//                         letterSpacing: 0.1,
//                         lineHeight: 20,
//                         marginBottom: 3,
//                         fontWeight: "800",
//                         paddingTop: 10,
//                       }}
//                     >
//                       ₹{item.price}
//                     </Text>
//                     <Text
//                       style={{
//                         color: "white",
//                         fontSize: 12,
//                         textAlign: "right",
//                         letterSpacing: 0.1,
//                         lineHeight: 10,
//                         marginBottom: 0,
//                         paddingTop: 10,
//                         maxWidth: 170,
//                         lineHeight: 15,
//                       }}
//                     >
//                       {item.description.slice(0, 50)}..
//                     </Text>
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             ))
//           ) : (
//             <View
//               style={{
//                 flex: 1,
//                 justifyContent: "center",
//                 alignItems: "center",
//                 marginTop: 100,
//               }}
//             >
//               <Text
//                 style={{
//                   fontSize: 25,
//                   fontWeight: "800",
//                   textAlign: "center",
//                   color: "#6666664D",
//                   textTransform: "capitalize",
//                 }}
//               >
//                 No Subscription Plan Found
//               </Text>
//             </View>
//           )}
//         </ScrollView>
//       </View>
//     </View>
//   );
// };

// export default Subscription;
