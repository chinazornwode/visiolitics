import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
} from '@expo-google-fonts/montserrat';
import {
  Upload,
  Camera,
  Zap,
  User,
  Eye,
  Palette,
  Activity,
  Target,
  BarChart3,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import { useAppTheme } from '@/utils/theme';
import useUpload from '@/utils/useUpload';

export default function PhotoAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [upload, { loading: uploadLoading }] = useUpload();
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    totalAnalyses: 0,
    todayAnalyses: 0,
    avgAccuracy: 0,
    activeUsers: 0,
    trends: {
      totalTrend: '+0%',
      todayTrend: '+0',
      accuracyTrend: '+0%',
      usersTrend: '+0%',
    },
  });
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  useEffect(() => {
    requestPermissions();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.summary);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permission is required to upload photos.');
    }
    
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
    }
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setAnalysisResults(null);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setAnalysisResults(null);
    }
  };

  const analyzePhoto = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    
    try {
      // Upload the image first
      const uploadResult = await upload({
        reactNativeAsset: {
          uri: selectedImage,
          type: 'image/jpeg',
          name: 'photo.jpg',
        }
      });

      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }

      // Send the uploaded image URL to analysis API
      const response = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadResult.url
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Analysis API error:', errorData);
        throw new Error('Analysis failed');
      }

      const results = await response.json();
      setAnalysisResults(results);
      
      // Refresh analytics after successful analysis
      await fetchAnalytics();
      
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Failed', 'Could not analyze the photo. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const AnalysisCard = ({ title, value, icon: Icon, color, backgroundColor }) => (
    <View
      style={{
        backgroundColor: backgroundColor || colors.surface,
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        {Icon && <Icon size={20} color={color} />}
        <Text
          style={{
            fontFamily: 'Montserrat_500Medium',
            fontSize: 14,
            color: colors.secondary,
            marginLeft: Icon ? 8 : 0,
          }}
        >
          {title}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: 'Montserrat_600SemiBold',
          fontSize: 18,
          color: colors.primary,
        }}
      >
        {value}
      </Text>
    </View>
  );

  const StatCard = ({ title, value, icon: Icon, trend, isLoading = false }) => (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 4,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8,
        }}
      >
        <Icon size={24} color={colors.primary} />
        {trend && !isLoading && (
          <View
            style={{
              backgroundColor: colors.greenLight,
              borderRadius: 12,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontFamily: 'Montserrat_500Medium',
                color: colors.green,
              }}
            >
              {trend}
            </Text>
          </View>
        )}
      </View>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={{ marginBottom: 4 }}
        />
      ) : (
        <Text
          style={{
            fontFamily: 'Montserrat_600SemiBold',
            fontSize: 24,
            color: colors.primary,
            marginBottom: 4,
          }}
        >
          {value}
        </Text>
      )}
      <Text
        style={{
          fontFamily: 'Montserrat_500Medium',
          fontSize: 12,
          color: colors.secondary,
        }}
      >
        {title}
      </Text>
    </View>
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Fixed Header */}
      <View style={{ paddingTop: insets.top, backgroundColor: colors.background }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontFamily: 'Montserrat_600SemiBold',
              color: colors.primary,
              flex: 1,
            }}
          >
            Photo Analysis
          </Text>
          <View
            style={{
              backgroundColor: colors.purple,
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'Montserrat_600SemiBold',
                color: colors.primary,
              }}
            >
              AI Powered
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Analytics Dashboard */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: 'Montserrat_600SemiBold',
              color: colors.primary,
              marginBottom: 16,
            }}
          >
            Analytics Dashboard
          </Text>
          
          <View style={{ flexDirection: 'row', marginHorizontal: -4, marginBottom: 12 }}>
            <StatCard
              title="Total Analyses"
              value={analyticsData.totalAnalyses}
              icon={BarChart3}
              trend={analyticsData.trends.totalTrend}
              isLoading={isLoadingAnalytics}
            />
            <StatCard
              title="Today"
              value={analyticsData.todayAnalyses}
              icon={TrendingUp}
              trend={analyticsData.trends.todayTrend}
              isLoading={isLoadingAnalytics}
            />
          </View>
          
          <View style={{ flexDirection: 'row', marginHorizontal: -4 }}>
            <StatCard
              title="Accuracy"
              value={`${analyticsData.avgAccuracy}%`}
              icon={Target}
              trend={analyticsData.trends.accuracyTrend}
              isLoading={isLoadingAnalytics}
            />
            <StatCard
              title="Active Users"
              value={analyticsData.activeUsers}
              icon={Users}
              trend={analyticsData.trends.usersTrend}
              isLoading={isLoadingAnalytics}
            />
          </View>
        </View>

        {/* Photo Upload Section */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: 'Montserrat_600SemiBold',
              color: colors.primary,
              marginBottom: 16,
            }}
          >
            Upload Photo
          </Text>
          
          {selectedImage ? (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Image
                source={{ uri: selectedImage }}
                style={{
                  width: '100%',
                  height: 300,
                  borderRadius: 16,
                  marginBottom: 16,
                }}
                contentFit="cover"
              />
              
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginBottom: 12,
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
                onPress={analyzePhoto}
                disabled={isAnalyzing || uploadLoading}
              >
                {isAnalyzing || uploadLoading ? (
                  <ActivityIndicator color={isDark ? '#000000' : '#FFFFFF'} />
                ) : (
                  <>
                    <Zap size={20} color={isDark ? '#000000' : '#FFFFFF'} />
                    <Text
                      style={{
                        fontFamily: 'Montserrat_600SemiBold',
                        fontSize: 16,
                        color: isDark ? '#000000' : '#FFFFFF',
                        marginLeft: 8,
                      }}
                    >
                      Analyze Photo
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  borderRadius: 16,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
                onPress={() => setSelectedImage(null)}
              >
                <Text
                  style={{
                    fontFamily: 'Montserrat_500Medium',
                    fontSize: 14,
                    color: colors.secondary,
                  }}
                >
                  Choose Different Photo
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: colors.borderLight,
                borderStyle: 'dashed',
                padding: 40,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.surfaceVariant,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <Upload size={32} color={colors.secondary} />
              </View>
              
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: 'Montserrat_600SemiBold',
                  color: colors.primary,
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                Upload Your Photo
              </Text>
              
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Montserrat_400Regular',
                  color: colors.secondary,
                  textAlign: 'center',
                  marginBottom: 24,
                  lineHeight: 20,
                }}
              >
                Take a selfie or choose from your gallery to analyze facial features
              </Text>
              
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 16,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={takePhoto}
                >
                  <Camera size={16} color={isDark ? '#000000' : '#FFFFFF'} />
                  <Text
                    style={{
                      fontFamily: 'Montserrat_600SemiBold',
                      fontSize: 14,
                      color: isDark ? '#000000' : '#FFFFFF',
                      marginLeft: 8,
                    }}
                  >
                    Take Photo
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 16,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={pickImageFromGallery}
                >
                  <Upload size={16} color={colors.primary} />
                  <Text
                    style={{
                      fontFamily: 'Montserrat_600SemiBold',
                      fontSize: 14,
                      color: colors.primary,
                      marginLeft: 8,
                    }}
                  >
                    Gallery
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Analysis Results */}
        {analysisResults && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: 'Montserrat_600SemiBold',
                color: colors.primary,
                marginBottom: 16,
              }}
            >
              Analysis Results
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <AnalysisCard
                  title="Gender"
                  value={analysisResults.gender || 'Unknown'}
                  icon={User}
                  color={colors.blue}
                  backgroundColor={colors.blueLight}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AnalysisCard
                  title="Eye Color"
                  value={analysisResults.eyeColor || 'Unknown'}
                  icon={Eye}
                  color={colors.green}
                  backgroundColor={colors.greenLight}
                />
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <AnalysisCard
                  title="Hair Color"
                  value={analysisResults.hairColor || 'Unknown'}
                  icon={Palette}
                  color={colors.orange}
                  backgroundColor={colors.orangeLight}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AnalysisCard
                  title="Skin Tone"
                  value={analysisResults.skinTone || 'Unknown'}
                  icon={Palette}
                  color={colors.purple}
                  backgroundColor={colors.surface}
                />
              </View>
            </View>
            
            <AnalysisCard
              title="Lips Color"
              value={analysisResults.lipsColor || 'Unknown'}
              icon={Palette}
              color={colors.pink}
              backgroundColor={colors.surface}
            />
            
            <AnalysisCard
              title="Nose Type"
              value={analysisResults.noseType || 'Unknown'}
              icon={User}
              color={colors.orange}
              backgroundColor={colors.orangeLight}
            />
            
            <AnalysisCard
              title="Skin Quality"
              value={analysisResults.skinQuality || 'Unknown'}
              icon={Activity}
              color={colors.green}
              backgroundColor={colors.greenLight}
            />
            
            {analysisResults.confidence && (
              <AnalysisCard
                title="Confidence Score"
                value={`${Math.round(analysisResults.confidence * 100)}%`}
                icon={Target}
                color={colors.green}
                backgroundColor={colors.greenLight}
              />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}