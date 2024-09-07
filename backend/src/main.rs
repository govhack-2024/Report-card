use axum::{
    http::{HeaderMap, HeaderValue},
    routing::get,
};
use log::info;
use reqwest::header;
use routes::{get_api_rise_model, get_completion, get_elevation_data};
use street_search::NominatimService;
use tokio::net::TcpListener;
use tower_http::{
    cors::{AllowMethods, CorsLayer},
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};
use tracing::Level;
use tracing_subscriber::fmt;

pub mod config;
pub mod data;
pub mod elevation;
pub mod rise_model;
pub mod routes;
pub mod street_search;
pub mod tide_datasource;
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
        .route("/api/completion", get(get_completion))
        .route("/api/elevation", get(get_elevation_data))
        .route("/api/rise_model", get(get_api_rise_model))
        .nest_service(
            "/",
            ServeDir::new("./frontend/")
                .append_index_html_on_directories(true)
                .fallback(ServeFile::new("./frontend/index.html")),
        )
        .layer(
            CorsLayer::new()
                .allow_methods(AllowMethods::any())
                .allow_origin(HeaderValue::from_static("http://localhost:5173")),
        )
        .layer(TraceLayer::new_for_http())
        .with_state(nominatim_service);

    let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();

    info!("Server live on http://localhost:8080");

    axum::serve(listener, router.into_make_service())
        .await
        .unwrap();
}
