import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "./auth.header";

export const getTempleList = async (key) => {
  const keyword = key.queryKey[1];
  let url;
  if (keyword && keyword !== "") {
    url = `${BASEAPIURL}/temple/temple?keyword=${keyword}`;
  } else {
    url = `${BASEAPIURL}/temple/temple`;
  }
  let resp;
  await axios({
    url: url,
    method: "GET",
    headers: await authHeader(),
  })
    .then((res) => {
      resp = res.data;
    })
    .catch((err) => {
      console.log(err.response);
      resp = err.response;
    });

  return resp;
};


export const getAllEventsTemple = async (id) =>{
  let resp;
  
}

export const getTempleData = async (id) => {
 
  const dummyTempleData = {
    
    // memberName: "Harsh Kumar",
    memberAddress: "106 MIG, KHB Colony, 5 Block",
    memberPhone: "987654321",
    memberDescription: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1500s",
    memberCity: "Bangalore",
    memberEmail: "gj1@gmail.com",
    images: [
      {
        assetId: null,
        base64: null,
        duration: null,
        exif: null,
        fileName: null,
        filesize: null,
        height: 360,
        mimeType: "image/jpeg",
        rotation: null,
        type: "image",
        uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEhWV96tK_ZQiuMYY2YpnaC8t02-b6I-hJqXlFWfl8qff_kS8yYyVIPLAd0UvVmbqNqRg&usqp=CAU",
        width: 480,
      },
    ],
  };
  // return res.data;
  return dummyTempleData;
};