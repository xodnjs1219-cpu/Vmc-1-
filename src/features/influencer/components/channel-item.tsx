'use client';

import { useState } from 'react';
import { Pencil, Trash2, Instagram, Youtube, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useChannelUpdateMutation,
  useChannelDeleteMutation,
} from '@/features/influencer/hooks/useChannelMutation';
import type { ChannelResponse } from '@/features/influencer/lib/dto';
import { isValidChannelUrl } from '@/features/influencer/lib/validation';

type ChannelItemProps = {
  channel: ChannelResponse;
  onDelete?: () => void;
};

const platformIcons = {
  instagram: Instagram,
  youtube: Youtube,
  naver: Globe,
  threads: Globe,
};

const platformLabels = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  naver: '네이버 블로그',
  threads: 'Threads',
};

const statusLabels = {
  pending: '검증대기',
  verified: '검증완료',
  failed: '검증실패',
};

const statusVariants = {
  pending: 'secondary' as const,
  verified: 'default' as const,
  failed: 'destructive' as const,
};

export const ChannelItem = ({ channel, onDelete }: ChannelItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(channel.name);
  const [url, setUrl] = useState(channel.url);
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  const updateMutation = useChannelUpdateMutation();
  const deleteMutation = useChannelDeleteMutation();

  const Icon = platformIcons[channel.platform];

  const handleEdit = () => {
    setIsEditing(true);
    setName(channel.name);
    setUrl(channel.url);
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(channel.name);
    setUrl(channel.url);
    setErrors({});
  };

  const handleSave = () => {
    const newErrors: { name?: string; url?: string } = {};

    if (!name.trim()) {
      newErrors.name = '채널명을 입력해주세요';
    }

    if (!url.trim()) {
      newErrors.url = 'URL을 입력해주세요';
    } else if (!isValidChannelUrl(channel.platform, url)) {
      newErrors.url = `올바른 ${platformLabels[channel.platform]} URL 형식이 아닙니다`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateMutation.mutate(
      {
        channelId: channel.id,
        data: { name, url },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setErrors({});
        },
        onError: () => {
          setErrors({ url: '채널 수정에 실패했습니다' });
        },
      },
    );
  };

  const handleDelete = () => {
    if (
      !confirm(
        '정말 이 채널을 삭제하시겠습니까? 최소 1개의 채널이 필요합니다.',
      )
    ) {
      return;
    }

    deleteMutation.mutate(
      { channelId: channel.id },
      {
        onSuccess: () => {
          onDelete?.();
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <div>
              <CardTitle className="text-base">
                {platformLabels[channel.platform]}
              </CardTitle>
              <CardDescription>
                <Badge variant={statusVariants[channel.status]}>
                  {statusLabels[channel.status]}
                </Badge>
              </CardDescription>
            </div>
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                disabled={updateMutation.isPending || deleteMutation.isPending}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={updateMutation.isPending || deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`channel-name-${channel.id}`}>채널명</Label>
              <Input
                id={`channel-name-${channel.id}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="채널명을 입력하세요"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor={`channel-url-${channel.id}`}>URL</Label>
              <Input
                id={`channel-url-${channel.id}`}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
              {errors.url && (
                <p className="text-sm text-destructive mt-1">{errors.url}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? '저장 중...' : '저장'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium">채널명</p>
              <p className="text-sm text-muted-foreground">{channel.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">URL</p>
              <a
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {channel.url}
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};