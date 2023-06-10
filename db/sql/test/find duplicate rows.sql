SELECT * FROM dmisensor
WHERE device_id IN
    (SELECT device_id
    FROM 
        (SELECT device_id,
         ROW_NUMBER() OVER( PARTITION BY device_id
        ORDER BY  device_id ) AS row_num
        FROM dmisensor ) t
        WHERE t.row_num > 1 )
order by device_id