use axum::{
    http::{HeaderMap, HeaderValue},
    routing::get,
};
use data::LatLon;
use reqwest::header;
use routes::{get_completion, get_elevation_data};
use street_search::NominatimService;
use tokio::net::TcpListener;
use tracing::Level;
use tracing_subscriber::fmt;

pub mod config;
pub mod data;
pub mod elevation;
pub mod routes;
pub mod street_search;
pub mod vlm_estimator;

#[tokio::main]
async fn main() {
    fmt::fmt()
        .pretty()
        .with_file(true)
        .with_max_level(Level::INFO)
        .init();


    let client = Box::leak(Box::new(
        reqwest::Client::builder()
            .default_headers(HeaderMap::from_iter([(
                header::USER_AGENT,
                HeaderValue::from_static("Report-Card Backend"),
            )]))
            .build()
            .expect("Could not create reqwest client"),
    ));

    let nominatim_service =
        NominatimService::new("https://nominatim.openstreetmap.org".to_string(), client);

    let router = axum::Router::new()
        .route("/completion", get(get_completion))
        .route("/elevation", get(get_elevation_data))
        .with_state(nominatim_service);

    let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();

    axum::serve(listener, router.into_make_service())
        .await
        .unwrap();
}
