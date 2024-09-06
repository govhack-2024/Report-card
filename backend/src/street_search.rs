use reqwest::RequestBuilder;
use tracing::error;

use crate::data::Error;

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

    pub async fn send(self) -> Result<NominatimSearchResponse, Error> {
        let response = match self
            .nominatim_service
            .get("search?format=jsonv2")
            .query(&[("q", self.query)])
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

        match response.json::<NominatimSearchResponse>().await {
            Err(ex) => {
                error!("Could not deserialize api response {ex}");
                Err(Error::UnknownError)
            }

            Ok(res) => Ok(res),
        }
    }
}

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

    fn get(&self, path: impl std::fmt::Display) -> RequestBuilder {
        self.client.get(format!("{}/{path}", self.base_url))
    }
}
