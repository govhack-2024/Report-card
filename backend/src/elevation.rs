use std::error::Error;

use crate::{config::CONFIG, data::LatLon};

static ELEVATION_API_URL: &str = "https://lris.scinfo.org.nz/services/query/v1/raster.json";
static ELEVATION_LAYER: &str = "105722";




pub async fn get_elevation(lat_lon: LatLon) -> Result<f64, Box<dyn Error>> {
    let api_url = format!(
        "{}?key={}&layer={}&x={}&y={}",
        ELEVATION_API_URL, CONFIG.lris_portal_api_key, ELEVATION_LAYER, lat_lon.lon, lat_lon.lat
    );

    let response = reqwest::get(&api_url).await?;
    println!("{:?}", response.status());

    let json = response.json::<serde_json::Value>().await?;

    // If the band is null, it's at zero elevation
    let elevation = json["rasterQuery"]["layers"][ELEVATION_LAYER]["bands"][0]["value"]
        .as_f64()
        .unwrap_or(0.0);

    Ok(elevation)
}
