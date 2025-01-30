import axios from "axios"
import { BASEAPIURL } from "../infrastructure/constants"

export const getProductCategories =async () =>{
    const response = await axios({
        method: "GET",
        url: BASEAPIURL+"admin/categories"
    })
    // console.log(response.data);
    return response.data
}