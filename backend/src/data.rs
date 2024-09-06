use num_rational::Rational64;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct LatLon {
    pub lat: Rational64,
    pub lon: Rational64,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub enum Error {
    ApiError {
        api_name: &'static str,
        error: String,
    },

    UnknownError,
}
