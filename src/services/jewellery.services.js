import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "./auth.header";

export const getShopData = async () => {
  const res = await axios.get(
    `${BASEAPIURL}/vendor/vendor-for-user?module=store&role=shop`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getEachShopData = async (id) => {
  const res = await axios.get(`${BASEAPIURL}/vendor/vendor-for-user?id=${id}`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const getRetailersData = async () => {
  const res = await axios.get(
    `${BASEAPIURL}/vendor/vendor-for-user?module=store&role=vendor`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getWorkersData = async () => {
  const res = await axios.get(`${BASEAPIURL}/worker/worker`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const getWorkersSearchData = async (keyword) => {
  const res = await axios.get(
    `${BASEAPIURL}/worker/worker?keyword=${keyword}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getShopRetailerSearchData = async (props) => {
  const role = props.index === 1 ? "vendor" : "shop";
  const res = await axios.get(
    `${BASEAPIURL}/vendor/vendor?keyword=${props.search}&role=${role}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getJewelleryData = async (id) => {
  // const res = await axios.get(`${BASEAPIURL}/jewellery/${id}`, {
  //    headers: await authHeader(),
  // });
  const dummyJewelleryData = {
    productName: "Diamond Necklace",
    productQuantity: "1",
    productDescription: "Beautiful diamond necklace with platinum setting.",
    productQuality: "High",
    pieces: "1",
    productweight: "10 grams",
    images: [{
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
uri: "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FDaivajnyaBrahmin-164234a6-5681-4c2c-b3d0-69109a150d63/ImagePicker/6e6c86f0-d98f-43db-ad09-552033f1a310.jpeg",
width: 480,
    }
    
    ]
  };
  // return res.data;
  return dummyJewelleryData;
 };
 
export const editJewelleryData = async (id, formData) => {
  const res = await axios.patch(`${BASEAPIURL}/jewellery/${id}`, formData, {
     headers: await authHeader(),
  });
  return res.data;
 };

