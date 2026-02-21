import { useEffect, useState } from 'react';
import { Alert, Platform, View, Text, StyleSheet, Modal } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
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
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

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
        ? [{ text: '立即更新', onPress: () => downloadAndInstall(fullUrl) }]
        : [
            { text: '稍后再说', style: 'cancel' as const },
            { text: '立即更新', onPress: () => downloadAndInstall(fullUrl) },
          ];

      Alert.alert(
        '发现新版本',
        `新版本 v${version} 已发布，请更新以获得最佳体验。`,
        buttons,
        { cancelable: !forceUpdate }
      );
    } catch {}
  };

  const downloadAndInstall = async (url: string) => {
    try {
      setDownloading(true);
      setProgress(0);

      const fileUri = FileSystem.cacheDirectory + 'update.apk';

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
      }

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (downloadProgress) => {
          const pct = downloadProgress.totalBytesExpectedToWrite > 0
            ? Math.round((downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100)
            : 0;
          setProgress(pct);
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result?.uri) {
        Alert.alert('更新失败', '下载文件失败，请重试');
        setDownloading(false);
        return;
      }

      setDownloading(false);

      const contentUri = await FileSystem.getContentUriAsync(result.uri);

      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: 'application/vnd.android.package-archive',
      });
    } catch (e: any) {
      setDownloading(false);
      Alert.alert('更新失败', '安装过程出错，请重试\n' + (e?.message || ''));
    }
  };

  if (!downloading) return null;

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>正在下载更新</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '75%',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90D9',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export { APP_VERSION };
