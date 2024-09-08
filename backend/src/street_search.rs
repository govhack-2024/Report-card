use log::info;
use reqwest::RequestBuilder;
use tracing::error;

use crate::data::{Error, LatLon};

#[derive(serde::Serialize, serde::Deserialize)]
pub struct NominatimSearchResponse {
    #[serde(rename = "addresstype")]
    pub address_type: String,
    #[serde(rename = "boundingbox")]
    pub bounding_box: Vec<String>,
    pub category: String,
    pub display_name: String,
    pub importance: f64,
    pub lat: String,
    pub lon: String,
    pub licence: String,
    pub name: String,
    pub osm_id: i64,
    pub osm_type: String,
    pub place_id: i64,
    pub place_rank: i64,
    pub r#type: String,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct Address {
    pub house_number: String,
    pub road: String,
    pub state: String,
    pub postcode: String,
    pub country: String,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ReverseResult {
    pub display_name: String,
    pub address: Address,
}

pub struct SearchRequestBuilder<'a> {
    query: String,
    nominatim_service: &'a NominatimService,
}

impl<'a> SearchRequestBuilder<'a> {
    pub fn new(nominatim_service: &'a NominatimService) -> Self {
        Self {
            query: String::new(),
            nominatim_service,
        }
    }

    pub fn set_query(mut self, query: impl ToString) -> Self {
        self.query = query.to_string();

        self
    }

    pub async fn send(self) -> Result<Vec<NominatimSearchResponse>, Error> {
        let response = match self
            .nominatim_service
            .get("search?format=jsonv2")
            .query(&[("q", self.query),("viewbox", String::from("165.3166934650013,-32.44317582498243,179.43693863120595,-47.86908234091968")),("bounded", String::from("1"))])
            .send()
            .await
        {
            Err(ex) => {
                error!("Could not fetch from nominatim api: {}", ex);

                return Err(Error::UnknownError);
            }
            Ok(val) => val,
        };

        if response.status() != 200 {
            let status = response.status();
            error!(
                "Nominatim returned a non 200 status code: {}, Error: {:?}",
                status,
                response.text().await
            );

            return Err(Error::ApiError {
                api_name: "Nominatim",
                error: format!("Bad status code {}", status),
            });
        }

        match response.json::<Vec<NominatimSearchResponse>>().await {
            Err(ex) => {
                error!("Could not deserialize api response {ex:?}");
                Err(Error::UnknownError)
            }

            Ok(res) => Ok(res),
        }
    }
}

#[derive(Clone)]
pub struct NominatimService {
    base_url: String,
    client: &'static reqwest::Client,
}

impl NominatimService {
    pub fn new(base_url: String, client: &'static reqwest::Client) -> Self {
        return Self { base_url, client };
    }

    pub fn search<'a>(&'a self) -> SearchRequestBuilder<'a> {
        SearchRequestBuilder::new(self)
    }

    pub async fn reverse(&self, lat_lon: LatLon) -> Result<ReverseResult, Error> {
        let request = match self
            .get("/reverse")
            .query(&[("lat", lat_lon.lat), ("lon", lat_lon.lon)])
            .query(&[("format", "jsonv2")])
            .send()
            .await
        {
            Ok(res) => res,
            Err(ex) => {
                error!("Could not fetch from nominatin: {ex}");
                return Err(Error::UnknownError);
            }
        };

        if request.status() != 200 {
            error!(
                "Could not revers lon lat (api status: {}, error {:?})",
                request.status(),
                request.text().await
            );

            return Err(Error::UnknownError);
        }

        let data = match request.json().await {
            Ok(data) => data,
            Err(ex) => {
                error!("Could not deserialize response: {ex}");
                return Err(Error::UnknownError);
            }
        };

        Ok(data)
    }

    fn get(&self, path: impl std::fmt::Display) -> RequestBuilder {
        self.client.get(format!("{}/{path}", self.base_url))
    }
}
