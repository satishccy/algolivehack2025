from algopy import ARC4Contract, String, GlobalState, Asset, UInt64, Txn, itxn, Global, Asset, BoxMap
from algopy.arc4 import abimethod, Address

class Contract(ARC4Contract):
    def __init__(self)->None:
        self.assetId = GlobalState(Asset)
        self.amount_required = GlobalState(UInt64)
        self.badge_name = GlobalState(String)
        self.badge_unit = GlobalState(String)
        self.badge_metadata_url = GlobalState(String)
        self.badge_owners = BoxMap(Address, Asset)

    @abimethod(create="require")
    def create(self,asset_id: Asset, name: String, unit: String, metadata_url: String, amount_required: UInt64) -> None:
        self.assetId.value = asset_id
        self.amount_required.value = amount_required
        self.badge_name.value = name
        self.badge_unit.value = unit
        self.badge_metadata_url.value = metadata_url

    @abimethod()
    def mint_badge(self) -> Asset:
        assert self.assetId.value.balance(Txn.sender) >= self.amount_required.value

        result = itxn.AssetConfig(total=1,decimals=0,unit_name=self.badge_unit.value,asset_name=self.badge_name.value,url=self.badge_metadata_url.value,freeze=Global.current_application_address,reserve=Global.current_application_address,manager=Global.current_application_address,clawback=Global.current_application_address,default_frozen=False).submit()
        self.badge_owners[Address(Txn.sender)] = result.created_asset
        return result.created_asset
    
    @abimethod()
    def claim_badge(self) -> None:
        assert Address(Txn.sender) in self.badge_owners
        asset_id = self.badge_owners[Address(Txn.sender)]
        itxn.AssetTransfer(xfer_asset=asset_id, asset_amount=1, asset_receiver=Txn.sender).submit()
        del self.badge_owners[Address(Txn.sender)]