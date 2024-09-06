use axum::{response::IntoResponse, Json};
use reqwest::StatusCode;
use serde_json::json;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct LatLon {
    pub lat: f64,
    pub lon: f64,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub enum Error {
    ApiError {
        api_name: &'static str,
        error: String,
    },

    ValidationError {
        message: String,
    },

    UnknownError,
}

impl Error {
    fn get_message(&self) -> String {
        match self {
            Error::ValidationError { message } => message,
            Error::ApiError { .. } => "An error occurred".to_string(),
            Error::UnknownError => "An error occurred".to_string(),
        }
    }

    fn get_status(&self) -> StatusCode {
        match self {
            Error::ValidationError { message } => StatusCode::BAD_REQUEST,
            Error::ApiError { .. } => StatusCode::INTERNAL_SERVER_ERROR,
            Error::UnknownError => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

impl IntoResponse for Error {
    fn into_response(self) -> axum::response::Response<axum::body::Body> {
        (
            self.get_status(),
            Json(json!({ "message": self.get_message() })),
        )
            .into_response()
    }
}
