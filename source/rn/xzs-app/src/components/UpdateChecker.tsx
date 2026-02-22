import { useEffect } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import { appVersionApi } from '../api';

const APP_VERSION = '1.16.0';

function compareVersions(current: string, latest: string): boolean {
  const c = current.split('.').map(n => parseInt(n, 10) || 0);
  const l = latest.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(c.length, l.length); i++) {
    const cv = c[i] || 0;
    const lv = l[i] || 0;
    if (lv > cv) return true;
    if (lv < cv) return false;
  }
  return false;
}

export default function UpdateChecker() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    checkUpdate();
  }, []);

  const checkUpdate = async () => {
    try {
      const res = await appVersionApi.check();
      if (res.code !== 1 || !res.response) return;
      const { version, downloadUrl } = res.response;
      if (!compareVersions(APP_VERSION, version)) return;

      const baseUrl = 'https://exam.440700.xyz';
      const fullUrl = `${baseUrl}${downloadUrl}`;

      Alert.alert(
        '发现新版本',
        `新版本 v${version} 已发布，请更新后继续使用。`,
        [
          {
            text: '立即更新',
            onPress: () => Linking.openURL(fullUrl)
          },
        ],
        { cancelable: false }
      );
    } catch { }
  };

  return null;
}

export { APP_VERSION };
