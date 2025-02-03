'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThumbsUp, ThumbsDown, Search, Car } from 'lucide-react';

interface Review {
  _id?: string;
  carNumber: string;
  review: string;
  rating: 'good' | 'neutral' | 'bad';
  date: string;
}

export default function Home() {
  const [carNumber, setCarNumber] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState<'good' | 'neutral' | 'bad'>('neutral'); // null 대신 'neutral'로 변경
  const [searchNumber, setSearchNumber] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('review');
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carNumber || !review || !rating) return;

    setIsLoading(true);
    setError(null);

    const newReview = {
      carNumber,
      review,
      rating,
      date: new Date().toLocaleDateString('ko-KR'),
    };

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || '리뷰 등록에 실패했습니다.');
      }

      setCarNumber('');
      setReview('');
      setRating('neutral');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '리뷰 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await fetch(`/api/reviews?carNumber=${encodeURIComponent(searchNumber)}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || '리뷰 검색에 실패했습니다.');
      }

      setReviews(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '리뷰 검색에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentReviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews?limit=10');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || '리뷰 로딩에 실패했습니다.');
      }

      setRecentReviews(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '리뷰 로딩에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'search') {
      setSearchNumber('');  // 검색어 초기화
      setSearched(false);   // 검색 상태 초기화
      setReviews([]);      // 검색 결과 초기화
      loadRecentReviews(); // 최근 리뷰 새로 불러오기
    }
  }, [activeTab]);

  const filteredReviews = reviews.filter(r =>
    r.carNumber.toLowerCase().includes(searchNumber.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white py-6">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Carnum.kr</h1>
            </div>
            <p className="text-sm">번호판 리뷰하기</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Tabs defaultValue="review" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="review">리뷰 등록</TabsTrigger>
            <TabsTrigger value="search">리뷰 검색</TabsTrigger>
          </TabsList>

          <TabsContent value="review">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="차량번호를 입력하세요 (예: 12가 3456)"
                      value={carNumber}
                      onChange={(e) => setCarNumber(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Textarea
                      placeholder="운전 매너에 대한 리뷰를 작성해주세요"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="w-full h-32"
                    />
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button
                      type="button"
                      variant={rating === 'good' ? 'default' : 'outline'}
                      onClick={() => setRating('good')}
                      className="flex items-center space-x-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>좋아요</span>
                    </Button>
                    <Button
                      type="button"
                      variant={rating === 'neutral' ? 'default' : 'outline'}
                      onClick={() => setRating('neutral')}
                      className="flex items-center space-x-2"
                    >
                      <span>보통이에요</span>
                    </Button>
                    <Button
                      type="button"
                      variant={rating === 'bad' ? 'default' : 'outline'}
                      onClick={() => setRating('bad')}
                      className="flex items-center space-x-2"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>나빠요</span>
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? '등록 중...' : '리뷰 등록하기'}
                  </Button>
                </form>

                {submitted && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      리뷰가 성공적으로 등록되었습니다.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="차량번호를 검색하세요"
                      value={searchNumber}
                      onChange={(e) => setSearchNumber(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <span className="animate-spin">⌛</span>
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mt-6 space-y-4">
                  {!searched && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">최근 등록된 리뷰</h3>
                      {recentReviews.map((review, index) => (
                        <Card key={index} className="mb-4">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold">{review.carNumber}</p>
                                <p className="text-gray-600 text-sm">{review.date}</p>
                              </div>
                              {review.rating === 'good' ? (
                                <ThumbsUp className="h-5 w-5 text-green-500" />
                              ) : review.rating === 'neutral' ? (
                                <span className="text-gray-500">●</span>
                              ) : (
                                <ThumbsDown className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                            <p className="mt-2">{review.review}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {searched && (
                    <>
                      {filteredReviews.length > 0 ? (
                        filteredReviews.map((review, index) => (
                          <Card key={index}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold">{review.carNumber}</p>
                                  <p className="text-gray-600 text-sm">{review.date}</p>
                                </div>
                                {review.rating === 'good' ? (
                                  <ThumbsUp className="h-5 w-5 text-green-500" />
                                ) : review.rating === 'bad' ? (
                                  <ThumbsDown className="h-5 w-5 text-red-500" />
                                ) : (
                                  <span className="text-gray-500">●</span>
                                )}
                              </div>
                              <p className="mt-2">{review.review}</p>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="text-center text-gray-500">검색 결과가 없습니다.</p>
                      )}
                    </>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}