use axum::routing::get;
use routes::get_completion;
use street_search::NominatimService;

pub mod data;
pub mod routes;
pub mod street_search;

#[tokio::main]
async fn main() {
    let client = Box::leak(reqwest::Client::new());
    let nominatim_service = NominatimService::new(client);

    let router = axum::Router::new().route("/completion", get(get_completion));
}
