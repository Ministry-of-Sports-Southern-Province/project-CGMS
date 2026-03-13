INSERT IGNORE INTO districts (name) VALUES
('Galle'),
('Matara'),
('Hambantota');

INSERT INTO ds_offices (district_id, name)
SELECT d.id, v.name FROM districts d
JOIN (
  SELECT 'Galle' AS district, 'Akmeemana' AS name UNION ALL
  SELECT 'Galle', 'Ambalangoda' UNION ALL
  SELECT 'Galle', 'Baddegama' UNION ALL
  SELECT 'Galle', 'Balapitiya' UNION ALL
  SELECT 'Galle', 'Benthota' UNION ALL
  SELECT 'Galle', 'Bope-Poddala' UNION ALL
  SELECT 'Galle', 'Elpitiya' UNION ALL
  SELECT 'Galle', 'Galle' UNION ALL
  SELECT 'Galle', 'Gonapinuwala' UNION ALL
  SELECT 'Galle', 'Habaraduwa' UNION ALL
  SELECT 'Galle', 'Hikkaduwa' UNION ALL
  SELECT 'Galle', 'Imaduwa' UNION ALL
  SELECT 'Galle', 'Karandeniya' UNION ALL
  SELECT 'Galle', 'Nagoda' UNION ALL
  SELECT 'Galle', 'Neluwa' UNION ALL
  SELECT 'Galle', 'Niyagama' UNION ALL
  SELECT 'Galle', 'Thawalama' UNION ALL
  SELECT 'Galle', 'Welivitiya-Divithura' UNION ALL
  SELECT 'Galle', 'Yakkalamulla' UNION ALL
  SELECT 'Matara', 'Akuressa' UNION ALL
  SELECT 'Matara', 'Athuraliya' UNION ALL
  SELECT 'Matara', 'Devinuwara' UNION ALL
  SELECT 'Matara', 'Dickwella' UNION ALL
  SELECT 'Matara', 'Hakmana' UNION ALL
  SELECT 'Matara', 'Kamburupitiya' UNION ALL
  SELECT 'Matara', 'Kirinda Puhulwella' UNION ALL
  SELECT 'Matara', 'Kotapola' UNION ALL
  SELECT 'Matara', 'Malimbada' UNION ALL
  SELECT 'Matara', 'Matara' UNION ALL
  SELECT 'Matara', 'Mulatiyana' UNION ALL
  SELECT 'Matara', 'Pasgoda' UNION ALL
  SELECT 'Matara', 'Pitabeddara' UNION ALL
  SELECT 'Matara', 'Thihagoda' UNION ALL
  SELECT 'Matara', 'Weligama' UNION ALL
  SELECT 'Matara', 'Welipitiya' UNION ALL
  SELECT 'Hambantota', 'Ambalantota' UNION ALL
  SELECT 'Hambantota', 'Angunakolapelessa' UNION ALL
  SELECT 'Hambantota', 'Beliatta' UNION ALL
  SELECT 'Hambantota', 'Hambantota' UNION ALL
  SELECT 'Hambantota', 'Katuwana' UNION ALL
  SELECT 'Hambantota', 'Lunugamwehera' UNION ALL
  SELECT 'Hambantota', 'Okewela' UNION ALL
  SELECT 'Hambantota', 'Sooriyawewa' UNION ALL
  SELECT 'Hambantota', 'Tangalle' UNION ALL
  SELECT 'Hambantota', 'Tissamaharama' UNION ALL
  SELECT 'Hambantota', 'Walasmulla' UNION ALL
  SELECT 'Hambantota', 'Weeraketiya'
) v ON v.district = d.name
WHERE NOT EXISTS (
  SELECT 1 FROM ds_offices ds WHERE ds.name = v.name AND ds.district_id = d.id
);
