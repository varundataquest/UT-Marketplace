
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User } from '@/api/entities';
import { Listing } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Edit, Star, ShoppingBag, Tag, Loader2, Upload, DollarSign, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ListingCard from '../components/listings/ListingCard';
import { UploadFile } from '@/api/integrations';
import { createPageUrl } from '@/_utils'; // Assuming createPageUrl is a utility function available at this path

export default function Profile() {
  const { id } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const isOwnProfile = !id || (currentUser && currentUser.id === id);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const me = await User.me().catch(() => null);
        setCurrentUser(me);
        
        const targetUserId = id || me?.id;
        if (!targetUserId) {
            setIsLoading(false);
            return;
        }

        const userToLoad = id ? await User.get(id) : me;
        setProfileUser(userToLoad);
        setEditData({
            full_name: userToLoad.full_name || '',
            bio: userToLoad.bio || '',
            major: userToLoad.major || '',
            year: userToLoad.year || '',
            paypal_username: userToLoad.paypal_username || '', 
            phone: userToLoad.phone || '',
        });

        const listings = await Listing.filter({ seller_email: userToLoad.email, status: 'active' });
        setUserListings(listings);

      } catch (error) {
        console.error("Failed to load profile", error);
      }
      setIsLoading(false);
    };
    loadProfile();
  }, [id]);

  const handleEditChange = (e) => {
    // This handles both direct input events and custom events from Select
    const { name, value } = e.target ? e.target : e;
    setEditData({ ...editData, [name]: value });
  };
  
  const handleProfilePicUpload = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      
      const { file_url } = await UploadFile({ file });
      await User.update(currentUser.id, { profile_image: file_url });
      setProfileUser(prev => ({...prev, profile_image: file_url}));
  }

  const saveChanges = async () => {
    await User.update(currentUser.id, editData);
    setProfileUser({ ...profileUser, ...editData });
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mt-10" /></div>;
  }
  
  if (!profileUser) {
    return <div className="text-center">User not found.</div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 sm:p-6"> {/* Added padding for smaller screens */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
                <Avatar className="w-32 h-32 text-4xl">
                  <AvatarImage src={profileUser.profile_image} alt={profileUser.full_name} />
                  <AvatarFallback>{profileUser.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                    <label htmlFor="profile-pic-upload" className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-gray-100">
                        <Upload className="w-4 h-4"/>
                        <input id="profile-pic-upload" type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
                    </label>
                )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-semibold text-gray-700">Full Name</label>
                    <Input name="full_name" value={editData.full_name} onChange={handleEditChange} />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700">Major</label>
                    <Input name="major" placeholder="e.g. Computer Science" value={editData.major} onChange={handleEditChange} />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700">Year</label>
                    <Select name="year" value={editData.year} onValueChange={(value) => handleEditChange({ target: { name: 'year', value } })}>
                      <SelectTrigger><SelectValue placeholder="Select your year" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="freshman">Freshman</SelectItem>
                        <SelectItem value="sophomore">Sophomore</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 flex items-center gap-2">
                      PayPal Username <DollarSign className="w-4 h-4 text-blue-500" />
                    </label>
                    <Input name="paypal_username" placeholder="for PayPal.Me" value={editData.paypal_username} onChange={handleEditChange} />
                    <p className="text-xs text-gray-500 mt-1">Used for direct payments.</p>
                  </div>
                   <div>
                    <label className="font-semibold text-gray-700 flex items-center gap-2">
                      Phone Number <Phone className="w-4 h-4 text-green-500" />
                    </label>
                    <Input name="phone" placeholder="e.g. 555-123-4567" value={editData.phone} onChange={handleEditChange} />
                     <p className="text-xs text-gray-500 mt-1">Visible to interested buyers.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-semibold text-gray-700">Bio</label>
                    <Textarea name="bio" placeholder="Tell us a little about yourself" value={editData.bio} onChange={handleEditChange} />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold">{profileUser.full_name}</h1>
                  <p className="text-gray-600 mt-2">{profileUser.bio || 'No bio yet.'}</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                    <Badge variant="outline">{profileUser.major || 'Undeclared'}</Badge>
                    <Badge variant="outline">{profileUser.year || 'Student'}</Badge>
                    {profileUser.paypal_username && (
                      <Badge variant="outline" className="flex items-center gap-1 border-blue-300 bg-blue-50 text-blue-800">
                          <DollarSign className="w-3 h-3"/> PayPal Ready
                      </Badge>
                    )}
                    {profileUser.phone && (
                        <Badge variant="outline" className="flex items-center gap-1 border-green-300 bg-green-50 text-green-800">
                            <Phone className="w-3 h-3"/> Contact Available
                        </Badge>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {isOwnProfile && (
                <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0"> {/* Added flex-col for small screens, gap and margin for spacing */}
                    {isEditing ? (
                      <>
                        <Button onClick={saveChanges} className="bg-ut-orange hover:bg-orange-700 text-black border border-black">Save</Button>
                        <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-black border border-black hover:bg-gray-100">Cancel</Button>
                      </>
                    ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)} className="border border-black text-black hover:bg-gray-100"><Edit className="w-4 h-4 mr-2"/>Edit Profile</Button>
                    )}
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Responsive Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="flex items-center p-4 gap-4">
              <Star className="w-8 h-8 text-yellow-500"/>
              <div>
                  <div className="text-2xl font-bold">{profileUser.trust_score || 'N/A'}</div>
                  <div className="text-sm text-gray-500">Trust Score</div>
              </div>
          </Card>
           <Card className="flex items-center p-4 gap-4">
              <ShoppingBag className="w-8 h-8 text-green-500"/>
              <div>
                  <div className="text-2xl font-bold">{profileUser.total_sales || 0}</div>
                  <div className="text-sm text-gray-500">Items Sold</div>
              </div>
          </Card>
           <Card className="flex items-center p-4 gap-4">
              <Tag className="w-8 h-8 text-blue-500"/>
              <div>
                  <div className="text-2xl font-bold">{profileUser.total_purchases || 0}</div>
                  <div className="text-sm text-gray-500">Items Purchased</div>
              </div>
          </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">{isOwnProfile ? "Your Active Listings" : `Listings from ${profileUser.full_name}`}</h2>
        {userListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userListings.map(listing => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                onView={(listing, options) => {
                  // Navigate to Browse page with this listing
                  window.location.href = createPageUrl(`Browse?listing=${listing.id}`);
                }}
              />
            ))}
          </div>
        ) : (
          <p>No active listings.</p>
        )}
      </div>
    </div>
  );
}
