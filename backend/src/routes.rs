use axum::extract::{FromRequestParts, Query, State};
use axum::http::request::Parts;
use axum::{async_trait, Json};
use serde::de::DeserializeOwned;
use tracing::error;

use crate::data::LatLon;
use crate::elevation::get_elevation;
use crate::rise_model::{get_rise_model, LocationRiseModel};
use crate::{
    data::Error,
    street_search::{NominatimSearchResponse, NominatimService},
};

pub struct QueryErr<T>(pub T);

#[async_trait]
impl<T, S> FromRequestParts<S> for QueryErr<T>
where
    T: DeserializeOwned,
    S: Send + Sync,
{
    type Rejection = Error;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        Query::<T>::try_from_uri(&parts.uri)
            .map(|Query(data)| QueryErr(data))
            .map_err(|ex| Error::ValidationError {
                message: ex.body_text(),
            })
    }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct CompletionRequest {
    query: String,
}

#[derive(serde::Serialize)]
pub struct CompletionResponse {
    osm_id: i64,
    category: String,
    display_name: String,
    lat_lon: LatLon,
    place_rank: i64,
}

pub async fn get_completion(
    State(nominatim_service): State<NominatimService>,
    QueryErr(CompletionRequest { query }): QueryErr<CompletionRequest>,
) -> Result<Json<Vec<CompletionResponse>>, Error> {
    Ok(Json(
        nominatim_service
            .search()
            .set_query(query)
            .send()
            .await?
            .into_iter()
            .map(
                |NominatimSearchResponse {
                     category,
                     display_name,
                     lat,
                     lon,
                     osm_id,
                     place_rank,
                     ..
                 }| {
                    Ok(CompletionResponse {
                        place_rank,
                        osm_id,
                        category,
                        display_name,
                        lat_lon: LatLon {
                            lat: lat.parse().map_err(|ex| {
                                error!("Nominatim returned invalid lat: {ex}");
                                Error::UnknownError
                            })?,
                            lon: lon.parse().map_err(|ex| {
                                error!("Nominatim returned invalid lat: {ex}");
                                Error::UnknownError
                            })?,
                        },
                    })
                },
            )
            .collect::<Result<Vec<_>, _>>()?,
    ))
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct GetElevationDataResponse {
    elevation: f64,
}

pub async fn get_elevation_data(
    QueryErr(lat_lon): QueryErr<LatLon>,
) -> Result<Json<GetElevationDataResponse>, Error> {
    Ok(Json(GetElevationDataResponse {
        elevation: get_elevation(&lat_lon).await?,
    }))
}

#[derive(serde::Deserialize)]
pub struct RiseModelOptions {
    lat: f64,
    lon: f64,
    address: Option<String>,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct GetApiRiseModelResponse {
    #[serde(flatten)]
    model_data: LocationRiseModel,
    address: String,
}

pub async fn get_api_rise_model(
    State(nominatim_service): State<NominatimService>,
    QueryErr(RiseModelOptions { lat, lon, address }): QueryErr<RiseModelOptions>,
) -> Result<Json<GetApiRiseModelResponse>, Error> {
    let lat_lon = LatLon { lat, lon };
    let model_data = get_rise_model(lat_lon).await?;

    let address = if let Some(address) = address {
        address
    } else {
        nominatim_service.reverse(lat_lon).await?.display_name
    };

    Ok(Json(GetApiRiseModelResponse {
        model_data,
        address,
    }))
}
