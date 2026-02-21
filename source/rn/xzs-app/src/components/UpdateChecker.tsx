import { useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { appVersionApi } from '../api';

const APP_VERSION = '1.2.0';

function compareVersions(current: string, latest: string): boolean {
  const c = current.split('.').map(Number);
  const l = latest.split('.').map(Number);
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
      const { version, forceUpdate, downloadUrl } = res.response;
      if (!compareVersions(APP_VERSION, version)) return;

      const baseUrl = 'https://exam.440700.xyz';
      const fullUrl = `${baseUrl}${downloadUrl}`;

      const buttons = forceUpdate
        ? [{ text: '立即更新', onPress: () => Linking.openURL(fullUrl) }]
        : [
            { text: '稍后再说', style: 'cancel' as const },
            { text: '立即更新', onPress: () => Linking.openURL(fullUrl) },
          ];

      Alert.alert(
        '发现新版本',
        `新版本 v${version} 已发布，请更新以获得最佳体验。`,
        buttons,
        { cancelable: !forceUpdate }
      );
    } catch {}
  };

  return null;
}

export { APP_VERSION };
