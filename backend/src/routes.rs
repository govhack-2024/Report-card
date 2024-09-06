use axum::extract::{FromRequestParts, Query, State};
use axum::http::request::Parts;
use axum::{async_trait, Json};
use serde::de::DeserializeOwned;

use crate::{
    data::Error,
    street_search::{NominatimSearchResponse, NominatimService},
};

#[derive(serde::Serialize, serde::Deserialize)]
pub struct CompletionRequest {
    query: String,
}

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

pub async fn get_completion(
    State(nominatim_service): State<NominatimService>,
    QueryErr(CompletionRequest { query }): QueryErr<CompletionRequest>,
) -> Result<Json<NominatimSearchResponse>, Error> {
    Ok(Json(
        nominatim_service.search().set_query(query).send().await?,
    ))
}
