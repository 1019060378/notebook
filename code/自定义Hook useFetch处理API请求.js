import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 自定义 Hook：处理 API 请求
 * @param {string} url - 请求地址
 * @param {object} options - 请求配置（method, body, headers 等）
 * @param {array} dependencies - 依赖项数组，变化时重新请求
 * @returns {object} { data, loading, error, refetch } - 请求状态和控制方法
 */
function useFetch(url, options = {}, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 用于存储 AbortController，组件卸载时取消请求
  const abortControllerRef = useRef(null);
  
  // 发送请求的核心函数
  const fetchData = useCallback(async (url, options) => {
    setLoading(true);
    setError(null);
    
    // 初始化 AbortController
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // 取消之前的请求
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    try {
      // 合并默认配置（GET 请求）
      const mergedOptions = {
        ...{ method: 'GET' },
        ...options,
        signal
      };
      
      const response = await fetch(url, mergedOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const responseData = await response.json();
      setData(responseData);
    } catch (err) {
      // 忽略因组件卸载导致的取消请求错误
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 依赖项变化时触发请求
  useEffect(() => {
    if (!url) return; // 无 URL 时不请求
    fetchData(url, options);
    
    // 组件卸载时清理
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, options, ...dependencies, fetchData]); // 依赖项变化时重新请求
  
  // 手动刷新请求的方法
  const refetch = useCallback(() => {
    fetchData(url, options);
  }, [url, options, fetchData]);
  
  return { data, loading, error, refetch };
}
