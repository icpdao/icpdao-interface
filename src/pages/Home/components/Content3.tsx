import React, { useState } from 'react';
import styles from '../index.less';
import { useIntl } from 'umi';
import { HeatmapLayer, LineLayer, MapboxScene, PointLayer, Marker } from '@antv/l7-react';
import geoData from '../../../assets/json/geo-data.json';
import mockData from '../../../assets/json/mock-home-data.json';
import gridData from '../../../assets/json/grid-data.json';
import { Avatar } from 'antd';

const joinMockData = (geodata: any, mockdata: any) => {
  const mockDataObj: any = {};
  mockdata.forEach((item: any) => {
    const { countryName, countryEnglishName, confirmedCount, user, desc, id } = item;
    mockDataObj[countryName] = {
      countryName,
      countryEnglishName,
      confirmedCount,
      user,
      desc,
      id,
    };
  });
  const pointData: any = [];
  const lineData: any = [];
  let prelanglat: any = [];
  geodata.features.forEach((feature: any) => {
    const { name } = feature.properties;
    if (mockDataObj[name]) {
      pointData.push({
        ...feature.properties,
        ...(mockDataObj[name] || {}),
      });
      if (prelanglat.length === 2)
        lineData.push({
          link: [prelanglat, feature.properties.centroid],
          op: {},
        });
      prelanglat = feature.properties.centroid;
    }
  });
  return { pointData, lineData };
};

const { pointData, lineData } = joinMockData(geoData, mockData);

const Content3: React.FC = () => {
  const intl = useIntl();
  const [mapData] = useState(pointData);
  const [mapFillData] = useState(gridData);

  return (
    <div className={styles.ContentFour}>
      <div key={'usersTitle'} className={styles.P8}>
        <div
          style={{ width: '800px' }}
          dangerouslySetInnerHTML={{ __html: intl.formatMessage({ id: 'pages.home.p8' }) }}
        />
      </div>
      <div key={'worksBanner'} className={styles.P9}>
        <MapboxScene
          option={{ logoVisible: false }}
          map={{
            center: [-3.996212596558315, 54.92932906692159],
            pitch: 0,
            style: 'blank',
            zoom: 1,
            minZoom: 1,
            maxZoom: 1,
            dragPan: false,
            dragRotate: false,
          }}
          className={styles.P9Map}
        >
          {pointData &&
            pointData.map((item: any) => {
              return (
                <Marker key={item?.id || ''} lnglat={item?.centroid}>
                  <div className={styles.P9Popup}>
                    <div className={styles.P9PopupTitle}>
                      <div className={styles.P9PopupTitleWrapper}>
                        <Avatar className={styles.P9PopupTitleAvatar} src={item?.user?.avatar} />
                        <span className={styles.P9PopupTitleNickname}>{item?.user?.nickname}</span>
                      </div>
                    </div>
                    <div
                      className={styles.P9PopupDesc}
                      dangerouslySetInnerHTML={{ __html: item?.desc }}
                    />
                  </div>
                </Marker>
              );
            })}
          {mapData && [
            <HeatmapLayer
              key={'1'}
              source={{
                data: mapFillData,
                transforms: [{ type: 'hexagon', size: 500000, field: 'capacity', method: 'sum' }],
              }}
              color={{ values: 'rgb(221,230,238)' }}
              shape={{ values: 'hexagon' }}
              style={{ coverage: 0.7, angle: 0.3, opacity: 0.8 }}
            />,
            <PointLayer
              key={'2'}
              animate={{ enable: true }}
              source={{
                data: mapData,
                parser: { type: 'json', coordinates: 'centroid' },
              }}
              scale={{
                values: { confirmedCount: { type: 'log' } },
              }}
              color={{ field: 'confirmedCount', values: () => '#1890ff' }}
              shape={{ values: 'circle' }}
              active={{ option: { color: '#1890ff' } }}
              size={{ field: 'confirmedCount', values: () => 50 }}
              style={{ opacity: 0.6 }}
            />,
            <LineLayer
              key={'3'}
              source={{
                data: lineData,
                parser: { type: 'json', coordinates: 'link' },
              }}
              color={{
                field: 'op',
                values: () => '#7bccc4',
              }}
              size={{
                field: 'op',
                values: () => 2,
              }}
              animate={{
                enable: true,
                interval: 2,
                trailLength: 2,
                duration: 1,
              }}
            />,
          ]}
        </MapboxScene>
      </div>
    </div>
  );
};

export default Content3;
