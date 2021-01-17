import React from "react"
import axios from 'axios'
import config from "../Utils/config"
const Stuff = (props) => {
    console.log(props.info)
    axios.post(`${config.BACKEND_URL}/shelter/admin/create`,
       {
           body: JSON.stringify(props.info)
       },{withCredentials:true})    
       .catch((err) =>
       {
           console.log(props.info)
           console.log(err)
       })

}
export default Stuff