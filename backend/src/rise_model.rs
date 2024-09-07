use crate::{data::{Error, LatLon}, elevation::get_elevation, tide_datasource::{get_tide_estimate, TideMeasurementSite}, vlm_estimator::{get_vlm_estimate, VLMEstimation}};

pub struct LocationRiseModel {
    pub lat_lon: LatLon,
    pub vlm_estimation: VLMEstimation,
    pub current_elevation: f64,
    pub tide_estimation: TideMeasurementSite,
}

// Compile sea-level-rise results together for the frontend elevation models
pub async fn get_rise_model(lat_lon: LatLon) -> Result<LocationRiseModel, Error> {
    let current_elevation = get_elevation(&lat_lon).await?;
    let vlm_estimation = get_vlm_estimate(&lat_lon);
    let tide_estimation = get_tide_estimate(&lat_lon);

    Ok( LocationRiseModel {
        lat_lon,
        vlm_estimation,
        current_elevation,
        tide_estimation,
    })
}