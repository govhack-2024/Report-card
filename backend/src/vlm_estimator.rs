use geo::LineString;
use log::info;
use once_cell::sync::Lazy;

use geo::prelude::HaversineLength;

use crate::data::LatLon;

static DATASET_PATH: &str = "./data/NZ_VLM_final_May24.csv";

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct VLMDatasetRecord {
    pub site_id: usize,
    pub lat_lon: LatLon,
    pub vertical_rate_bop_corrected: f64,
    pub sigma_uncertainty: f64,
    pub quality_factor: f64,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct VLMEstimation {
    pub closest_site: VLMDatasetRecord,
    pub rate_mm_per_year: f64,
}

static VLM_DATASET: Lazy<Vec<VLMDatasetRecord>> = Lazy::new(|| {
    let mut rdr = csv::Reader::from_path(DATASET_PATH).unwrap();

    let mut dataset = vec![];

    for result in rdr.records() {
        let csv_record = result.unwrap();
        let record = VLMDatasetRecord {
            site_id: csv_record[0].parse().unwrap(),
            lat_lon: LatLon {
                lat: csv_record[2].parse().unwrap(),
                lon: csv_record[1].parse().unwrap(),
            },
            vertical_rate_bop_corrected: csv_record[3].parse().unwrap(),
            sigma_uncertainty: csv_record[4].parse().unwrap(),
            quality_factor: csv_record[5].parse().unwrap(),
        };

        dataset.push(record);
    }

    info!("Loaded {} VLM records", dataset.len());


    return dataset;
});

pub fn get_vlm_estimate(location: &LatLon) -> VLMEstimation {
    let mut closest_site = 0;
    let mut closest_distance = f64::MAX;
    

    // Simple linear search to find the closest site
    for (i, site) in VLM_DATASET.iter().enumerate() {
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

    let rate_mm_per_year = VLM_DATASET[closest_site].vertical_rate_bop_corrected;

    VLMEstimation {
        closest_site: VLM_DATASET[closest_site].to_owned(),
        rate_mm_per_year,
    }

}