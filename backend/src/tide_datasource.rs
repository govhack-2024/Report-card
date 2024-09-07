use std::{collections::HashMap, error};

use geo::LineString;
use log::info;
use once_cell::sync::Lazy;

use geo::prelude::HaversineLength;

use crate::data::LatLon;

static DATASET_PATH: &str = "./data/tide-stations.csv";

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct TideMeasurementSite {
    pub site_id: usize,
    pub location: String,
    pub lat_lon: LatLon,
    pub spring_tide_max: f64,
    pub spring_tide_min: f64,
    pub neap_tide_max: f64,
    pub neap_tide_min: f64,
    pub surge_tide_max: f64,
    pub surge_tide_min: f64,
}

// WKT,id,location,latitude,longitude,ref_stn,tg_bm,cd_to_bm,mhws,mhwn,mlwn,mlws,msl,hat,lat,data_start,data_end,data_len,owner,gauge_type,pred_link,data_link,int_number,shape_X,shape_Y

fn parse_row(row: HashMap<String, String>) -> Result<TideMeasurementSite, Box< dyn error::Error>> {
    // Attempt to parse, many lines are incomplete, which we can just error and leave alone
    
    let lat_lon = LatLon {
        lat: row["latitude"].parse()?,
        lon: row["longitude"].parse()?,
    };
    // Baseline to compare the rest of the results to
    let mean_sea_level: f64 = row["msl"].parse()?;

    let mhws: f64 = row["mhws"].parse()?;
    let mlws: f64 = row["mlws"].parse()?;
    let mhwn: f64 = row["mhwn"].parse()?;
    let mlwn: f64 = row["mlwn"].parse()?;
    let hat: f64 = row["hat"].parse()?;
    let msl: f64 = row["msl"].parse()?;


    Ok(TideMeasurementSite {
        site_id: row["id"].parse()?,
        location: row["location"].to_string(),
        lat_lon,
        spring_tide_max: mhws - mean_sea_level,
        spring_tide_min: mlws - mean_sea_level,
        neap_tide_max: mhwn - mean_sea_level,
        neap_tide_min: mlwn - mean_sea_level,
        surge_tide_max: hat - mean_sea_level,
        surge_tide_min: msl - mean_sea_level,

    })
}

static TIDE_DATASET: Lazy<Vec<TideMeasurementSite>> = Lazy::new(|| {
    let mut rdr = csv::Reader::from_path(DATASET_PATH).unwrap();

    let mut dataset = vec![];

    for result in rdr.deserialize() {
        let csv_record: HashMap<String, String> = result.unwrap();
        
        // Parse out fields
        match parse_row(csv_record) {
            Ok(record) => dataset.push(record),
            Err(_) => continue,
        }
    }

    info!("Loaded {} tide measurement sites", dataset.len());

    return dataset;
});

pub fn get_tide_estimate(location: &LatLon) -> TideMeasurementSite {
    let mut closest_site = 0;
    let mut closest_distance = f64::MAX;
    
    // Simple search to find the closest site
    for (i, site) in TIDE_DATASET.iter().enumerate() {
        let linestring = LineString::<f64>::from(vec![
            (location.lon, location.lat),
            (site.lat_lon.lon, site.lat_lon.lat),
        ]);
    
        let distance = linestring.haversine_length();

        if distance < closest_distance {
            closest_distance = distance;
            closest_site = i;
        }
    }

    TIDE_DATASET[closest_site].clone()
}