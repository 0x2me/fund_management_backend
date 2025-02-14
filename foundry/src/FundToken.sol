// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FundToken {
    struct FundMetrics {
        uint256 totalAssetValue;
        uint256 sharesSupply;
        uint256 lastUpdateTime;
    }

    mapping(address => uint256) public balances;
    uint256 public totalShares;
    uint256 public totalValue;

    event Investment(
        address indexed investor,
        uint256 usdAmount,
        uint256 sharesIssued,
        uint256 sharePrice
    );
    event Redemption(
        address indexed investor,
        uint256 shares,
        uint256 usdAmount,
        uint256 sharePrice
    );
    event MetricsUpdated(
        uint256 totalAssetValue,
        uint256 sharesSupply,
        uint256 sharePrice
    );

    function invest(
        address investor,
        uint256 usdAmount
    ) external returns (uint256 sharesIssued) {
        sharesIssued = usdAmount / 10; // 1 share = $10
        balances[investor] += sharesIssued;
        totalShares += sharesIssued;
        totalValue += usdAmount;
        emit Investment(investor, usdAmount, sharesIssued, getSharePrice());
    }

    function redeem(
        address investor,
        uint256 shares
    ) external returns (uint256 usdAmount) {
        require(balances[investor] >= shares, 'Not enough shares');
        usdAmount = shares * 10; // 1 share = $10
        balances[investor] -= shares;
        totalShares -= shares;
        totalValue -= usdAmount;
        emit Redemption(investor, shares, usdAmount, getSharePrice());
    }

    function getFundMetrics()
        external
        view
        returns (uint256, uint256, uint256)
    {
        return (totalValue, totalShares, block.timestamp);
    }

    function getSharePrice() public view returns (uint256) {
        return totalShares == 0 ? 10 : totalValue / totalShares;
    }

    function balanceOf(address investor) external view returns (uint256) {
        return balances[investor];
    }
}
