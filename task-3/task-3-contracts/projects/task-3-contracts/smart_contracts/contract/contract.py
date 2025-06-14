from algopy import ARC4Contract, GlobalState, UInt64, Txn,Account, itxn, Global, Asset
from algopy.arc4 import abimethod

class TokenizerContract(ARC4Contract):
    def __init__(self) -> None:
        self.admin = GlobalState(Txn.sender)
        self.asa_id = GlobalState(Asset)

    @abimethod()
    def modify_asa(self, asa_id: Asset) -> None:
        assert Txn.sender == self.admin.value
        self.asa_id.value = asa_id

    @abimethod()
    def modify_admin(self, admin: Account) -> None:
        assert Txn.sender == self.admin.value
        self.admin.value = admin

    @abimethod()
    def verified_airdrop(self,amount: UInt64, recipient: Account) -> None:
        assert Txn.sender == self.admin.value, "Only admin can airdrop"
        itxn.AssetTransfer(
            asset_amount=amount,
            asset_receiver=recipient,
            asset_sender=self.asa_id.value.reserve,
            sender=Global.current_application_address,
            xfer_asset=self.asa_id.value, 
        ).submit()
