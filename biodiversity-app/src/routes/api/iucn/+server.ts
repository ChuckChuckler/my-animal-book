import type { RequestHandler } from "../$types";
import { json } from "@sveltejs/kit";

let iucnApiKey:string = "IUCN_KEY";

export const POST: RequestHandler=async({request})=>{
    let { genus, species } = await request.json();
    try{
        const response = await fetch(`https://api.iucnredlist.org/api/v4/taxa/scientific_name?genus_name=${genus}&species_name=${species}`,{
            headers:{
                Authorization: `Bearer ${iucnApiKey}`
            }
        });
        const data = await response.json();
        return json({msg:data});
    }catch(e){
        return json({msg:e});
    }
    /*await axios.get("https://api.iucnredlist.org/api/v4/taxa/scientific_name",{
        headers: {
            Authorization: `Bearer ${iucnApiKey}`
        },
        params: {
            genus_name: genus,
            species_name: species
        }
    })
    .then((response)=>{
        return json({msg:response.data})
    })
    .catch((e)=>{
        return json({msg:e});
    })

    return json({msg:`${genus} ${species}`});*/
}